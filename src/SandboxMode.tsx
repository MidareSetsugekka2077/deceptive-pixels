import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { trackAnalyticsEvent } from './lib/analytics';

export function SandboxMode() {
	const navigate = useNavigate();

	const exitToHome = () => {
		trackAnalyticsEvent('sandbox_exit_clicked');
		navigate('/');
	};

	return (
		<div className="min-h-screen bg-[#d8d8d8] p-6">
			<Button onClick={exitToHome} variant="outline">
				Exit
			</Button>
		</div>
	);
}
