import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TitleScreen } from './TitleScreen';
import { PixelAttack } from './attacks/PixelAttack';
import { RotateAttack } from './attacks/RotateAttack';
import { ShiftAttack } from './attacks/ShiftAttack';
import { NoiseAttack } from './attacks/NoiseAttack';
import { BlurAttack } from './attacks/BlurAttack';
import { AdversarialPatches } from './attacks/AdversarialPatches';
import { Gallery } from './Gallery';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <Routes>
      <Route
        path="/"
        element={<TitleScreen onPlay={() => navigate('/pixel-attack')} />}
      />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/pixel-attack" element={<PixelAttack />} />
      <Route path="/rotate-attack" element={<RotateAttack />} />
      <Route path="/shift-attack" element={<ShiftAttack />} />
      <Route path="/random-noise-attack" element={<NoiseAttack />} />
      <Route path="/blur-attack" element={<BlurAttack />} />
      <Route path="/adversarial-patches" element={<AdversarialPatches />} />
    </Routes>
  );
}
