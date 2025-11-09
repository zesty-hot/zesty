'use client';

import { usePushNotifications } from '@/lib/hooks/use-push-notifications';
import { Button } from '@/components/ui/button';
import { RiBellLine, RiNotificationOffLine } from '@remixicon/react';

export function PushNotificationToggle() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="text-sm text-neutral-500">
        Push notifications are not supported on this device
      </div>
    );
  }

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      alert('Failed to update notification settings. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h3 className="font-medium">Push Notifications</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {permission === 'denied'
            ? 'Notifications are blocked. Please enable them in your browser settings.'
            : 'Get notified about messages, live-streams, matches, and events'}
        </p>
      </div>
      <Button
        onClick={handleToggle}
        disabled={isLoading || permission === 'denied'}
        variant={isSubscribed ? 'default' : 'outline'}
      >
        {isLoading ? (
          'Loading...'
        ) : isSubscribed ? (
          <>
            <RiBellLine className="w-4 h-4 mr-2" />
            Enabled
          </>
        ) : (
          <>
            <RiNotificationOffLine className="w-4 h-4 mr-2" />
            Enable
          </>
        )}
      </Button>
    </div>
  );
}
