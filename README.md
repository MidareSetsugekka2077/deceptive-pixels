# Deceptive Pixels

A challenge-based game where players try to find images that exploit each model's weaknesses. Players select "adversarial" examples and learn about weaknesses in CNNs and ViTs.

### Version 1
- Game title: Deceptive Pixels
- Implemented the UI from the Figma Prototype
- Added first attack: Pixel attack using MNIST dataset
- Added scoring system to keep track of how many images users selected correctly
- Added feedback after each round to reinforce the idea that CNNs are not perfect.
- Players should choose 3 correct images that can fool the CNN model from the 6 given.

### Version 2
- Updated attacks to showcase 3 different attacks: Pixel Attack, Rotate Attack, Shift Attack
- Adjusted Pixel attack diffculty to be harder.
- Added explanations for why each attack can fool the CNNs.
- Added tutorial option so users can understand the background and context better.
- Trained new sets of images for the 2 new attacks added.

### Version 3
- UI Overhaul: Added title screen, challenge selection below title screen
- Added 3 more attacks: Random Noise Attack, Blur Attack, Adversarial Patches
- Added ImageNet images for all 6 attacks alongside MNIST
- Scoring system overhaul: Players can get a maximum of 30 points for each attack from each dataset.
- Added badge to show which attack players are currently on.
- Fixed tutorial disappearing after first visit bug.
- Made game title clickable for easier navigation.
