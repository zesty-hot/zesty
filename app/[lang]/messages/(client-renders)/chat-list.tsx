'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { anonSupabase, useSupabaseSession } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { formatDistanceToNow } from '@/lib/utils';

interface ChatUser {
  id: string;
  slug: string | null;
  images?: { url: string }[];
}

interface LastMessage {
  id: string;
  content: string;
  createdAt: Date;
  sender: ChatUser;
}

interface ChatListItem {
  id: string;
  otherUser: ChatUser;
  lastMessage: LastMessage | null;
  createdAt: Date;
  unreadCount?: number;
}

export function ChatList() {
  const { data: session, status, user } = useSupabaseSession();
  const params = useParams();
  const lang = params?.lang as string;

  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!user) return;

    // Fetch initial chats and unread counts
    fetchChats();
    fetchUnreadCounts();

    // TODO: restrict this to chats involving the current user only
    const channel = anonSupabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chatmessage',
        },
        (payload) => {
          fetchChats();
          fetchUnreadCounts();
        }
      ).subscribe((status) => {
        console.log('[CHAT-LIST] Subscription status:', status);
      });

    return () => {
      anonSupabase.removeChannel(channel);
    };
  }, [session, status]);

  async function fetchChats() {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch chats');

      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCounts() {
    try {
      const response = await fetch('/api/messages/unread-count');
      if (!response.ok) return;

      const data = await response.json();
      const counts: Record<string, number> = {};

      data.unreadByChat?.forEach((item: { chatId: string; count: number }) => {
        counts[item.chatId] = item.count;
      });

      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
        <div className="border-b border-gray-200 p-4 bg-white">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
          <p className="text-gray-600 text-lg">No messages yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Start a conversation with someone to see your messages here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-[calc(100vh-12rem)]">
      <div className="border-b border-gray-200 p-4 bg-white">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/${lang}/messages/${chat.id}`}
            className="block border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="shrink-0 h-12 w-12 rounded-full bg-gray-300 overflow-hidden">
                {chat.otherUser?.images?.[0]?.url ? (
                  <img
                    src={chat.otherUser.images[0].url}
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-700">
                      {chat.otherUser?.slug?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold truncate text-gray-800">
                    {chat.otherUser?.slug || 'Unknown User'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {unreadCounts[chat.id] > 0 && (
                      <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {unreadCounts[chat.id] > 99 ? '99+' : unreadCounts[chat.id]}
                      </span>
                    )}
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt))}
                      </span>
                    )}
                  </div>
                </div>

                {chat.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage.sender.id === session?.user.id ? 'You: ' : ''}
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
