from __future__ import annotations

import argparse
import base64
import os
from io import BytesIO
from pathlib import Path
from typing import Literal

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms


ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "models"
DATA_DIR = ROOT / "data"
MNIST_MODEL_PATH = MODEL_DIR / "mnist_sandbox_medium_cnn.pt"
os.environ.setdefault("TORCH_HOME", str(MODEL_DIR / "torch"))
DEFAULT_MNIST_EPOCHS = 1
BATCH_SIZE = 128
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MNIST_LABELS = [str(label) for label in range(10)]


class MediumMnistCnn(nn.Module):
    def __init__(self, dropout: float = 0.5):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3)
        self.conv2 = nn.Conv2d(16, 24, kernel_size=3)
        self.conv2_drop = nn.Dropout2d(p=dropout)
        self.fc1 = nn.Linear(600, 48)
        self.fc2 = nn.Linear(48, 10)
        self.fc1_drop = nn.Dropout(p=dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = torch.relu(F.max_pool2d(self.conv1(x), 2))
        x = torch.relu(F.max_pool2d(self.conv2_drop(self.conv2(x)), 2))
        x = x.view(-1, x.size(1) * x.size(2) * x.size(3))
        x = torch.relu(self.fc1_drop(self.fc1(x)))
        return self.fc2(x)


class ClassifyRequest(BaseModel):
    dataset: Literal["mnist", "imagenet"]
    imageDataUrl: str
    originalImageDataUrl: str | None = None
    trueLabel: int | None = None


class ClassifyResponse(BaseModel):
    prediction: int
    confidence: float
    success: bool | None
    model: str
    predictionLabel: str | None = None
    baselinePrediction: int | None = None
    baselineLabel: str | None = None
    baselineConfidence: float | None = None


app = FastAPI(title="Deceptive Pixels Sandbox CNN API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_origin_regex=r"^http://(127\.0\.0\.1|localhost):\d+$",
    allow_methods=["*"],
    allow_headers=["*"],
)

_mnist_model: MediumMnistCnn | None = None
_imagenet_model: nn.Module | None = None
_imagenet_transform = None
_imagenet_categories: list[str] | None = None


def train_mnist_model(epochs: int = DEFAULT_MNIST_EPOCHS) -> MediumMnistCnn:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    torch.manual_seed(0)
    transform = transforms.ToTensor()
    dataset = datasets.MNIST(
        root=str(DATA_DIR),
        train=True,
        download=True,
        transform=transform,
    )
    train_size = int(len(dataset) * 0.9)
    valid_size = len(dataset) - train_size
    train_dataset, valid_dataset = random_split(
        dataset,
        [train_size, valid_size],
        generator=torch.Generator().manual_seed(0),
    )
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
    )
    valid_loader = DataLoader(valid_dataset, batch_size=BATCH_SIZE)

    model = MediumMnistCnn().to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.002)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            images = images.to(DEVICE)
            labels = labels.to(DEVICE)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)

        valid_correct = 0
        valid_total = 0
        model.eval()
        with torch.no_grad():
            for images, labels in valid_loader:
                images = images.to(DEVICE)
                labels = labels.to(DEVICE)
                predictions = model(images).argmax(dim=1)
                valid_correct += (predictions == labels).sum().item()
                valid_total += labels.size(0)

        train_loss = running_loss / len(train_dataset)
        valid_acc = valid_correct / valid_total
        print(
            f"epoch {epoch + 1}/{epochs} "
            f"train_loss={train_loss:.4f} valid_acc={valid_acc:.4f}",
            flush=True,
        )

    torch.save(model.state_dict(), MNIST_MODEL_PATH)
    return model


def load_mnist_model() -> MediumMnistCnn:
    global _mnist_model
    if _mnist_model is not None:
        return _mnist_model

    model = MediumMnistCnn().to(DEVICE)
    if not MNIST_MODEL_PATH.exists():
        _mnist_model = train_mnist_model()
        _mnist_model.eval()
        return _mnist_model

    state_dict = torch.load(MNIST_MODEL_PATH, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.eval()
    _mnist_model = model
    return model


def load_imagenet_model() -> nn.Module:
    global _imagenet_categories
    global _imagenet_model
    global _imagenet_transform

    if _imagenet_model is not None:
        return _imagenet_model

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    weights = models.MobileNet_V3_Small_Weights.IMAGENET1K_V1
    model = models.mobilenet_v3_small(weights=weights).to(DEVICE)
    model.eval()

    _imagenet_model = model
    _imagenet_transform = weights.transforms()
    _imagenet_categories = list(weights.meta.get("categories", []))
    return model


def image_data_url_to_pil(image_data_url: str, mode: str) -> Image.Image:
    try:
        encoded = image_data_url.split(",", 1)[1]
    except IndexError as exc:
        raise HTTPException(status_code=400, detail="Invalid image data URL") from exc

    try:
        image_bytes = base64.b64decode(encoded)
        return Image.open(BytesIO(image_bytes)).convert(mode)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Could not decode image") from exc


def pil_to_mnist_tensor(image: Image.Image) -> torch.Tensor:
    image = image.convert("L")
    if image.size != (28, 28):
        image = image.resize((28, 28), Image.Resampling.BILINEAR)

    array = np.asarray(image, dtype=np.float32) / 255.0
    tensor = torch.from_numpy(array).unsqueeze(0).unsqueeze(0).to(DEVICE)
    return tensor


def image_data_url_to_mnist_tensor(image_data_url: str) -> torch.Tensor:
    image = image_data_url_to_pil(image_data_url, "L")
    return pil_to_mnist_tensor(image)


def pil_to_imagenet_tensor(image: Image.Image) -> torch.Tensor:
    image = image.convert("RGB")
    if _imagenet_transform is None:
        load_imagenet_model()
    tensor = _imagenet_transform(image).unsqueeze(0).to(DEVICE)
    return tensor


def image_data_url_to_imagenet_tensor(image_data_url: str) -> torch.Tensor:
    image = image_data_url_to_pil(image_data_url, "RGB")
    return pil_to_imagenet_tensor(image)


def predict(
    model: nn.Module,
    tensor: torch.Tensor,
    categories: list[str],
) -> tuple[int, float, str]:
    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.softmax(logits, dim=1)
        confidence, prediction = probabilities.max(dim=1)

    predicted_label = int(prediction.item())
    label = (
        categories[predicted_label]
        if 0 <= predicted_label < len(categories)
        else str(predicted_label)
    )
    return predicted_label, float(confidence.item()), label


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "device": str(DEVICE),
        "mnistModel": "ready" if MNIST_MODEL_PATH.exists() else "not_trained",
        "imagenetModel": "loaded" if _imagenet_model is not None else "lazy",
    }


@app.post("/classify", response_model=ClassifyResponse)
def classify(request: ClassifyRequest) -> ClassifyResponse:
    if request.dataset == "mnist":
        model = load_mnist_model()
        tensor = image_data_url_to_mnist_tensor(request.imageDataUrl)
        predicted_label, confidence, prediction_label = predict(
            model,
            tensor,
            MNIST_LABELS,
        )
        baseline_prediction = None
        baseline_confidence = None
        baseline_label = None

        if request.originalImageDataUrl:
            baseline_tensor = image_data_url_to_mnist_tensor(
                request.originalImageDataUrl,
            )
            (
                baseline_prediction,
                baseline_confidence,
                baseline_label,
            ) = predict(model, baseline_tensor, MNIST_LABELS)

        success = (
            predicted_label != request.trueLabel
            if request.trueLabel is not None
            else (
                predicted_label != baseline_prediction
                if baseline_prediction is not None
                else None
            )
        )

        return ClassifyResponse(
            prediction=predicted_label,
            confidence=confidence,
            success=success,
            model="mnist-sandbox-medium-cnn",
            predictionLabel=prediction_label,
            baselinePrediction=baseline_prediction,
            baselineLabel=baseline_label,
            baselineConfidence=baseline_confidence,
        )

    try:
        model = load_imagenet_model()
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Could not load ImageNet model: {exc}",
        ) from exc

    categories = _imagenet_categories or []
    tensor = image_data_url_to_imagenet_tensor(request.imageDataUrl)
    predicted_label, confidence, prediction_label = predict(model, tensor, categories)

    baseline_prediction = None
    baseline_confidence = None
    baseline_label = None
    if request.originalImageDataUrl:
        baseline_tensor = image_data_url_to_imagenet_tensor(
            request.originalImageDataUrl,
        )
        (
            baseline_prediction,
            baseline_confidence,
            baseline_label,
        ) = predict(model, baseline_tensor, categories)

    success = (
        predicted_label != baseline_prediction
        if baseline_prediction is not None
        else None
    )

    return ClassifyResponse(
        prediction=predicted_label,
        confidence=confidence,
        success=success,
        model="mobilenet-v3-small-imagenet1k",
        predictionLabel=prediction_label,
        baselinePrediction=baseline_prediction,
        baselineLabel=baseline_label,
        baselineConfidence=baseline_confidence,
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8000, type=int)
    parser.add_argument("--train-mnist", action="store_true")
    parser.add_argument("--epochs", default=DEFAULT_MNIST_EPOCHS, type=int)
    args = parser.parse_args()

    if args.train_mnist:
        train_mnist_model(epochs=args.epochs)
        return

    import uvicorn

    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
