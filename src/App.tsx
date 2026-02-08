import { Routes, Route, useNavigate } from 'react-router-dom';
import { TitleScreen } from './TitleScreen';
import { PixelAttack } from './PixelAttack';
import { RotateAttack } from './RotateAttack';
import { ShiftAttack } from './ShiftAttack';

export default function App() {
  const navigate = useNavigate();

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
