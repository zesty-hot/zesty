'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

/**
 * Shows a count of unread messages
 * Note: This is a basic implementation. For production, you'd want to:
 * 1. Add a 'readAt' field to ChatMessage
 * 2. Track which messages each user has read
 * 3. Subscribe to changes in read status
 */
export function UnreadMessagesBadge({ className }: { className?: string }) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    console.log('[UNREAD BADGE] Component mounted');

    // Fetch initial unread count
    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ChatMessage',
        },
        (payload) => {
          console.log('[UNREAD BADGE] New message detected via realtime:', payload);
          // Refresh count when new message arrives
          fetchUnreadCount();
        }
      )
      .subscribe((status) => {
        console.log('[UNREAD BADGE] Subscription status:', status);
      });

    return () => {
      console.log('[UNREAD BADGE] Unsubscribing');
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function fetchUnreadCount() {
    try {
      const response = await fetch('/api/messages/unread-count');
      if (!response.ok) return;
      
      const data = await response.json();
      console.log('[UNREAD BADGE] Fetched unread count:', data);
      setUnreadCount(data.totalUnread || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }

  if (unreadCount === 0) return null;

  return (
    <Badge variant="destructive" className={className}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}
