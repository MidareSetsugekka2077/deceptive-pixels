import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { TitleScreen } from './TitleScreen';
import { PixelAttack } from './attacks/PixelAttack';
import { RotateAttack } from './attacks/RotateAttack';
import { ShiftAttack } from './attacks/ShiftAttack';
import { NoiseAttack } from './attacks/NoiseAttack';
import { BlurAttack } from './attacks/BlurAttack';
import { AdversarialPatches } from './attacks/AdversarialPatches';
import { EmojiAttack } from './attacks/EmojiAttack';
import { LineAttack } from './attacks/LineAttack';
import { MirrorAttack } from './attacks/MirrorAttack';
import { Gallery } from './Gallery';
import { Help } from './Help';
import { SandboxMode } from './SandboxMode';
import { initAnalytics, trackAnalyticsEvent } from './lib/analytics';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackAnalyticsEvent('screen_view', {
      pathname: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search]);

  return (
    <Routes>
      <Route
        path="/"
        element={<TitleScreen onPlay={() => navigate('/pixel-attack')} />}
      />
      <Route path="/sandbox" element={<SandboxMode />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/help" element={<Help />} />
      <Route path="/pixel-attack" element={<PixelAttack />} />
      <Route path="/rotate-attack" element={<RotateAttack />} />
      <Route path="/shift-attack" element={<ShiftAttack />} />
      <Route path="/random-noise-attack" element={<NoiseAttack />} />
      <Route path="/blur-attack" element={<BlurAttack />} />
      <Route path="/adversarial-patches" element={<AdversarialPatches />} />
      <Route path="/emoji-attack" element={<EmojiAttack />} />
      <Route path="/line-attack" element={<LineAttack />} />
      <Route path="/mirror-attack" element={<MirrorAttack />} />
    </Routes>
  );
}
