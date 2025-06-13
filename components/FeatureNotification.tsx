/**
 * Feature Notification Component
 * Shows users when advanced features are active
 */

import React, { useState, useEffect } from 'react';
import { realtimeManager } from '../utils/realtime';
import { pwaManager } from '../utils/pwaUtils';

interface FeatureNotificationProps {
  onClose?: () => void;
}

const FeatureNotification: React.FC<FeatureNotificationProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [features, setFeatures] = useState({
    realtime: false,
    pwa: false,
    offline: false,
    cache: false,
  });

  useEffect(() => {
    // Check feature status
    const checkFeatures = () => {
      const realtimeState = realtimeManager.getState();
      const pwaState = pwaManager.getInstallationState();
      
      setFeatures({
        realtime: realtimeState.isConnected,
        pwa: pwaState.isInstallable || pwaState.isInstalled,
        offline: 'serviceWorker' in navigator,
        cache: 'indexedDB' in window,
      });
    };

    // Initial check
    checkFeatures();

    // Show notification after a delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Listen for real-time connection changes
    const unsubscribe = realtimeManager.on('connected', checkFeatures);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const activeFeatures = Object.entries(features).filter(([, active]) => active);

  if (!isVisible || activeFeatures.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg p-4 transform transition-all duration-500 ease-in-out">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse mr-2"></div>
              <h4 className="font-semibold text-sm">Advanced Features Active!</h4>
            </div>
            <div className="text-xs space-y-1">
              {features.realtime && (
                <div className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  Real-time updates connected
                </div>
              )}
              {features.pwa && (
                <div className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  PWA features available
                </div>
              )}
              {features.offline && (
                <div className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  Offline support enabled
                </div>
              )}
              {features.cache && (
                <div className="flex items-center">
                  <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                  Advanced caching active
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureNotification;
