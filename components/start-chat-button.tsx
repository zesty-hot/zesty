'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { RiMessage3Line } from '@remixicon/react';

interface StartChatButtonProps {
  otherUserSlug: string;
  lang?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  className?: string;
}

/**
 * Button component to start a chat with another user
 * Creates a new chat or navigates to existing one
 */
export function StartChatButton({
  otherUserSlug,
  lang = 'en',
  variant = 'default',
  size = 'default',
  children,
  className,
}: StartChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStartChat() {
    setLoading(true);

    try {
      const response = await fetch('/api/messages/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserSlug }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const chat = await response.json();
      
      // Navigate to the chat
      router.push(`/${lang}/messages/${chat.id}`);
      return;
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleStartChat}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <>
          {children || (
            <>
              <RiMessage3Line className="h-4 w-4 mr-2" />
              Message
            </>
          )}
        </>
      )}
    </Button>
  );
}
