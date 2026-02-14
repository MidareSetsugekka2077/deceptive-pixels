import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TitleScreen } from './TitleScreen';
import { PixelAttack } from './PixelAttack';
import { RotateAttack } from './RotateAttack';
import { ShiftAttack } from './ShiftAttack';

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
      <Route path="/pixel-attack" element={<PixelAttack />} />
      <Route path="/rotate-attack" element={<RotateAttack />} />
      <Route path="/shift-attack" element={<ShiftAttack />} />
    </Routes>
  );
}
