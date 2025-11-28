"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// Dummy data for notifications
const DUMMY_NOTIFICATIONS = [
  {
    id: "1",
    type: "like",
    text: "liked your post",
    user: {
      slug: "alice_w",
      images: [{ url: "https://i.pravatar.cc/150?u=alice" }],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    read: false,
  },
  {
    id: "2",
    type: "comment",
    text: "commented: 'Great photo!'",
    user: {
      slug: "bob_builder",
      images: [{ url: "https://i.pravatar.cc/150?u=bob" }],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
  },
  {
    id: "3",
    type: "follow",
    text: "started following you",
    user: {
      slug: "charlie_chaplin",
      images: [{ url: "https://i.pravatar.cc/150?u=charlie" }],
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: "4",
    type: "system",
    text: "Welcome to Zesty! Complete your profile to get started.",
    user: {
      slug: "Zesty Team",
      images: [], // System notification might not have user image
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
];

interface NotificationsSheetProps {
  children: React.ReactNode;
  className?: string;
}

export function NotificationsSheet({ children, className }: NotificationsSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className={className}>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full max-w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  <div className="shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.user.images?.[0]?.url} />
                      <AvatarFallback>
                        {notification.user.slug?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {notification.user.slug}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">
                      {notification.text}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
