import { useEffect, useState } from 'react';
import { DeviceMobile, X, DownloadSimple } from '@phosphor-icons/react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed prompt
    const dismissed = localStorage.getItem('me_pwa_dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait 3 seconds before showing so it doesn't interrupt initial page load
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('me_pwa_dismissed', String(Date.now()));
  };

  if (!show || !deferredPrompt) return null;

  return (
    <aside className="pwa-install-banner" aria-label="Install Manchanda Electricals App">
      <div className="pwa-install-banner__content">
        <div className="pwa-install-banner__icon">
          <DeviceMobile size={24} weight="light" />
        </div>
        <div className="pwa-install-banner__text">
          <strong>Install Manchanda Electricals</strong>
          <span>Add to home screen for fast wholesale quotes &amp; offline catalogue</span>
        </div>
      </div>

      <div className="pwa-install-banner__actions">
        <button
          type="button"
          onClick={handleInstall}
          className="pwa-install-btn"
          aria-label="Install app on device"
        >
          <DownloadSimple size={16} weight="bold" />
          <span>Install App</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="pwa-dismiss-btn"
          aria-label="Dismiss installation prompt"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </aside>
  );
}
