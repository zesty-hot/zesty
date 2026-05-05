'use client';

import { useEffect, useState } from 'react';
import { useSupabaseSession } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

/**
 * Shows a count of unread messages
 * Note: This is a basic implementation. For production, you'd want to:
 * 1. Add a 'readAt' field to ChatMessage
 * 2. Track which messages each user has read
 * 3. Subscribe to changes in read status
 */
export function UnreadMessagesBadge({ className }: { className?: string }) {
  const { data: session, status, user, supabase } = useSupabaseSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!user) return;

    fetchUnreadCount();

    const unreadInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(unreadInterval);
    };
  }, [user, status, session]);

  async function fetchUnreadCount() {
    try {
      const response = await fetch('/api/messages/unread-count');
      if (!response.ok) return;

      const data = await response.json();
      console.log('[UNREAD BADGE] Fetched unread count:', data);
      setUnreadCount(data.totalUnread || 0);
    } catch (error) {
      console.error('[UNREAD BADGE] Error fetching unread count:', error);
    }
  }

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className={className}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}
