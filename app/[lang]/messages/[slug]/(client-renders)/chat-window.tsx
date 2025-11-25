'use client';

import { useEffect, useState, useRef } from 'react';
import { anonSupabase, useSupabaseSession } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from '@/lib/utils';
import { RiSendPlaneFill } from '@remixicon/react';
import { MakeOfferButton } from '@/components/make-offer-button';
import { OfferCard } from '@/components/offer-card';
import ProfileModal from '@/components/profile-modal';
import { AlertTriangle, TriangleAlert } from 'lucide-react';

interface ChatUser {
  id: string;
  slug: string | null;
  images?: { url: string }[];
}

interface PrivateAd {
  id: string;
  title: string;
  description: string;
  active: boolean;
  workerId: string;
  services: any[];
  extras: any[];
  daysAvailable: string[];
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: ChatUser;
}

interface Offer {
  id: string;
  amount: number;
  service: string;
  durationMin: number;
  extras: string[];
  scheduledFor: Date | null;
  isAsap: boolean;
  status: string;
  createdAt: Date;
  clientId: string;
  workerId: string;
  client: ChatUser;
  worker: ChatUser;
}

interface ChatData {
  id: string;
  otherUser: ChatUser;
  messages: Message[];
  offers?: Offer[];
  otherUserAd?: PrivateAd | null;
}

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: session, status, user } = useSupabaseSession();
  const [chat, setChat] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const channel = anonSupabase
      .channel('chat:' + chatId,)
      .on('broadcast', { event: '*' }, (payload) => {
        console.log('Broadcast received:', payload);
      })
      .subscribe((status) => console.log('Subscription status:', status));

    return () => { anonSupabase.removeChannel(channel) };
  }, [chatId]);


  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user || !chatId) return;

    console.log('[CHAT WINDOW] Component mounted, chatId:', chatId);

    // Fetch initial messages
    fetchMessages();

    // Mark messages as read
    markMessagesAsRead();

    console.log('[CHAT WINDOW] Setting up realtime subscription for chatId:', chatId);
    let channelName = `chat-${chatId}`;
    const channel = anonSupabase.channel(channelName).on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chatmessage',
        filter: `chatId=eq.${chatId}`,
      },
      (payload) => {
        console.log('[CHAT WINDOW] New message received via realtime:', payload);

        const newMsg = payload.new as any;

        setChat((prevChat) => {
          if (!prevChat) return prevChat;

          if (prevChat.messages.some(m => m.id === newMsg.id)) return prevChat;

          return {
            ...prevChat,
            messages: [
              ...prevChat.messages,
              {
                id: newMsg.id,
                content: newMsg.content,
                createdAt: new Date(newMsg.createdAt),
                senderId: newMsg.senderId,
                sender:
                  newMsg.slug === user?.slug
                    ? { id: newMsg.user.id, slug: user?.slug || null, images: [{ url: getCurrentUserImageUrl(chat) || '' }] }
                    : prevChat.otherUser,
              },
            ],
          };
        });

        scrollToBottom();
      }
    ).on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'PrivateOffer',
        filter: `chatId=eq.${chatId}`,
      },
      (payload) => {
        console.log('[CHAT WINDOW] PrivateOffer changed via realtime:', payload);
        fetchMessages();
      }
    );

    // Activate the channel
    channel.subscribe();

    return () => {
      console.log('[CHAT WINDOW] Unsubscribing from chat:', chatId);
      anonSupabase.removeChannel(channel);
    };
  }, [session, chatId, status]);



  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Try to find the current user's default image URL from existing chat data
  function getCurrentUserImageUrl(fromChat?: ChatData | null) {
    const myId = session?.user.id;
    if (!myId || !fromChat) return undefined;

    // Look for any message sent by the current user that already includes sender.images
    const myMsgWithImage = fromChat.messages?.find(
      (m) => m.senderId === myId && (m.sender?.images?.length || 0) > 0 && m.sender?.images?.[0]?.url
    );

    return myMsgWithImage?.sender?.images?.[0]?.url;
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  async function fetchMessages() {
    try {
      const response = await fetch(`/api/messages/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      console.log('[CHAT WINDOW] Fetched chat data:', {
        chatId: data.id,
        messagesCount: data.messages?.length || 0,
        offersCount: data.offers?.length || 0,
        offers: data.offers
      });
      setChat(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markMessagesAsRead() {
    try {
      await fetch(`/api/messages/${chatId}/mark-read`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    setNewMessage(''); // Clear input immediately

    // Optimistically add the message to the UI
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date(),
      senderId: (session?.user as any)?.id,
      sender: {
        id: (session?.user as any)?.id,
        slug: (session?.user as any)?.slug || null,
        images: [{ url: getCurrentUserImageUrl(chat) || '' }], // Use existing image URL if available
      },
    };

    setChat((prevChat) => {
      if (!prevChat) return prevChat;
      return {
        ...prevChat,
        messages: [...prevChat.messages, optimisticMessage],
      };
    });

    // Scroll to bottom immediately
    scrollToBottom();

    try {
      const response = await fetch(`/api/messages/${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const actualMessage = await response.json();

      // Replace the optimistic message with the real one
      setChat((prevChat) => {
        if (!prevChat) return prevChat;
        return {
          ...prevChat,
          messages: prevChat.messages.map(msg =>
            msg.id === tempId ? { ...actualMessage, sender: optimisticMessage.sender } : msg
          ),
        };
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic message on error
      setChat((prevChat) => {
        if (!prevChat) return prevChat;
        return {
          ...prevChat,
          messages: prevChat.messages.filter(msg => msg.id !== tempId),
        };
      });
      setNewMessage(messageContent); // Restore message on error
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex flex-row border-b p-4">
        <div className="flex-1  items-center gap-3">
          <Avatar className="h-10 w-10" onClick={() => setProfileOpen(true)}>
            {chat.otherUser?.images?.[0]?.url ? (
              <img
                src={chat.otherUser.images[0].url}
                alt="User"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                <span className="font-semibold">
                  {chat.otherUser?.slug?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </Avatar>
          <button
            onClick={() => setProfileOpen(true)}
            className="ml-3 font-semibold text-left hover:underline focus:outline-none"
            aria-label={`Open profile for ${chat.otherUser?.slug || 'user'}`}
          >
            {chat.otherUser?.slug || 'Unknown User'}
          </button>
          <ProfileModal slug={chat.otherUser?.slug} open={profileOpen} onOpenChange={setProfileOpen} />
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="lg"
            title="Report channel"
          >
            <TriangleAlert className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Private Ad Banner */}
      {chat.otherUserAd && chat.otherUserAd.active && (
        <Card className="m-4 p-4 bg-linear-to-r from-rose-500/10 to-pink-500/10 border-rose-500/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{chat.otherUserAd.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {chat.otherUserAd.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>🔧 {chat.otherUserAd.services.length} service{chat.otherUserAd.services.length !== 1 ? 's' : ''}</span>
                {chat.otherUserAd.extras.length > 0 && (
                  <span>➕ {chat.otherUserAd.extras.length} extra{chat.otherUserAd.extras.length !== 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <MakeOfferButton ad={chat.otherUserAd} chatId={chatId} />
            </div>
          </div>
        </Card>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {chat.messages.length === 0 && (!chat.offers || chat.offers.length === 0) ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          (() => {
            // Combine messages and offers, then sort by createdAt
            const items: Array<{ type: 'message' | 'offer'; data: Message | Offer; createdAt: Date }> = [
              ...(chat.messages || []).map(msg => ({
                type: 'message' as const,
                data: msg,
                createdAt: new Date(msg.createdAt)
              })),
              ...(chat.offers || []).map(offer => ({
                type: 'offer' as const,
                data: offer,
                createdAt: new Date(offer.createdAt)
              })),
            ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

            return items.map((item, index) => {
              if (item.type === 'offer') {
                const offer = item.data as Offer;
                const isSent = offer.clientId === (session?.user as any)?.id;

                return (
                  <div key={`offer-${offer.id}`} className="my-4">
                    <OfferCard
                      offer={offer}
                      type={isSent ? 'sent' : 'received'}
                      onUpdate={fetchMessages}
                    />
                  </div>
                );
              } else {
                const message = item.data as Message;
                const isOwn = message.senderId === (session?.user as any)?.id;

                return (
                  <div
                    key={`message-${message.id}`}
                    className={`flex w-full mt-2 space-x-3 max-w-xs ${isOwn ? 'ml-auto justify-end' : ''
                      }`}
                  >
                    <div className="shrink-0 h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
                      {message.sender.images?.[0]?.url ? (
                        <img
                          src={message.sender.images[0].url}
                          alt="User"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs font-semibold">
                            {message.sender.slug?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        className={`p-3 ${isOwn
                          ? 'bg-blue-600 text-white rounded-l-lg rounded-br-lg'
                          : 'bg-gray-300 rounded-r-lg rounded-bl-lg'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 leading-none">
                        {formatDistanceToNow(new Date(message.createdAt))}
                      </span>
                    </div>
                  </div>
                );
              }
            });
          })()
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-gray-300 p-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type your message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            className="flex-1 h-10 rounded px-3 text-sm bg-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="shrink-0 p-5"
          >
            {sending ? <Spinner className="h-4 w-4" /> : <RiSendPlaneFill className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
