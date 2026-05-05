import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { profileId, direction, superLike = false } = await request.json();

    if (!profileId || !direction) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's dating page
    const userDatingPage = await withRetry(() =>
      prisma.datingPage.findUnique({
        where: { zesty_id: user.zesty_id, active: true },
        select: { id: true },
      })
    );

    if (!userDatingPage) {
      return NextResponse.json(
        { error: 'Dating profile not found' },
        { status: 404 }
      );
    }

    // Record the swipe
    const swipe = await withRetry(() =>
      prisma.datingSwipe.create({
        data: {
          swiperId: userDatingPage.id,
          swipedId: profileId,
          direction: direction === 'like' ? 'LIKE' : 'PASS',
          superLike,
        },
      })
    );

    // If it's a LIKE, check for mutual match
    let match = null;
    if (direction === 'like') {
      // Check if the other person already liked us
      const reciprocalSwipe = await withRetry(() =>
        prisma.datingSwipe.findFirst({
          where: {
            swiperId: profileId,
            swipedId: userDatingPage.id,
            direction: 'LIKE',
          },
        })
      );

      if (reciprocalSwipe) {
        // Check if match already exists
        const existingMatch = await withRetry(() =>
          prisma.datingMatch.findFirst({
            where: {
              OR: [
                {
                  user1Id: userDatingPage.id,
                  user2Id: profileId,
                },
                {
                  user1Id: profileId,
                  user2Id: userDatingPage.id,
                },
              ],
            },
          })
        );

        if (!existingMatch) {
          // Get the other user's actual userId (not datingPageId)
          const otherDatingPage = await withRetry(() =>
            prisma.datingPage.findUnique({
              where: { id: profileId },
              select: { zesty_id: true },
            })
          );

          if (!otherDatingPage) {
            return NextResponse.json(
              { error: 'Profile not found' },
              { status: 404 }
            );
          }

          // Create a chat first
          const chat = await withRetry(() =>
            prisma.chat.create({
              data: {
                activeUsers: {
                  connect: [{ zesty_id: user.zesty_id }, { zesty_id: otherDatingPage.zesty_id }],
                },
              },
            })
          );

          // Then create the match
          match = await withRetry(() =>
            prisma.datingMatch.create({
              data: {
                user1Id: userDatingPage.id,
                user2Id: profileId,
                chatId: chat.id,
              },
              include: {
                user2: {
                  include: {
                    user: {
                      select: {
                        zesty_id: true,
                        slug: true,
                        title: true,
                        images: {
                          where: { default: true },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            })
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      swipeId: swipe.id,
      match: match
        ? {
          id: match.id,
          profile: {
            id: match.user2.zesty_id,
            title: match.user2.user.title || match.user2.user.slug,
            image: match.user2.user.images[0]?.url || null,
          },
        }
        : null,
    });
  } catch (error) {
    console.error('Error recording swipe:', error);
    return NextResponse.json(
      { error: 'Failed to record swipe' },
      { status: 500 }
    );
  }
}
