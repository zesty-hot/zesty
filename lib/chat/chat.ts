import { prisma } from '../prisma';

/**
 * Create a new chat between two users if one doesn't already exist
 * @param user1Id - First user ID
 * @param user2Id - Second user ID
 * @returns The chat object (existing or newly created)
 */
export async function getOrCreateChat(user1slug: string, user2slug: string) {
  // First, try to find an existing chat between these two users
  const existingChat = await prisma.chat.findFirst({
    where: {
      AND: [
        {
          activeUsers: {
            some: {
              slug: user1slug,
            },
          },
        },
        {
          activeUsers: {
            some: {
              slug: user2slug,
            },
          },
        },
      ],
      // Make sure it's a two-person chat (not a group)
      activeUsers: {
        every: {
          slug: {
            in: [user1slug, user2slug],
          },
        },
      },
    },
    include: {
      activeUsers: {
        select: {
          zesty_id: true,
          slug: true,
          images: {
            where: { default: true },
            select: { url: true }
          }
        },
      },
    },
  });

  if (existingChat) {
    return existingChat;
  }

  // Create a new chat if one doesn't exist
  const newChat = await prisma.chat.create({
    data: {
      activeUsers: {
        connect: [
          { slug: user1slug },
          { slug: user2slug },
        ],
      },
    },
    include: {
      activeUsers: {
        select: {
          zesty_id: true,
          slug: true,
          images: {
            where: { default: true },
            select: { url: true }
          }
        },
      },
    },
  });

  return newChat;
}

/**
 * Create a group chat with multiple users
 * @param userIds - Array of user IDs to include in the chat
 * @returns The created chat object
 */
export async function createGroupChat(userIds: string[]) {
  if (userIds.length < 2) {
    throw new Error('A chat must have at least 2 users');
  }

  const chat = await prisma.chat.create({
    data: {
      activeUsers: {
        connect: userIds.map((zesty_id) => ({ zesty_id })),
      },
    },
    include: {
      activeUsers: {
        select: {
          zesty_id: true,
          slug: true,
          images: {
            where: { default: true },
            select: { url: true }
          }
        },
      },
    },
  });

  return chat;
}

/**
 * Hide a chat for a specific user (removes from their active chats but doesn't delete)
 * @param chatId - The chat ID
 * @param userId - The user ID who wants to hide the chat
 */
export async function hideChat(chatId: string, userId: string) {
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      activeUsers: {
        disconnect: { zesty_id: userId },
      },
      hiddenUsers: {
        connect: { zesty_id: userId },
      },
    },
  });
}

/**
 * Unhide a chat for a specific user
 * @param chatId - The chat ID
 * @param userId - The user ID who wants to unhide the chat
 */
export async function unhideChat(chatId: string, userId: string) {
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      hiddenUsers: {
        disconnect: { zesty_id: userId },
      },
      activeUsers: {
        connect: { zesty_id: userId },
      },
    },
  });
}
