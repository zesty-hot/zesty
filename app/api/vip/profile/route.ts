import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { slug, cursor, limit = 20 } = await req.json();
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Get current user to check subscription status
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.email ? (
      await withRetry(() => prisma.user.findUnique({ where: { email: currentUser.email } }))
    )?.id : undefined;

    // Fetch the VIP page with user info
    const vipPage = await withRetry(() => prisma.vIPPage.findFirst({
      where: {
        user: {
          slug: slug,
        },
        active: true,
      },
      include: {
        user: {
          select: {
            id: true,
            slug: true,
            bio: true,
            location: true,
            suburb: true,
            lastActive: true,
            createdAt: true,
            images: {
              where: {
                default: true,
              },
              select: {
                url: true,
              },
              take: 1,
            },
          },
        },
        discountOffers: {
          where: {
            active: true,
            validFrom: {
              lte: new Date(),
            },
            OR: [
              { validUntil: null },
              { validUntil: { gte: new Date() } },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            content: true,
          },
        },
      },
    }));

    if (!vipPage) {
      return NextResponse.json(
        { error: 'VIP page not found' },
        { status: 404 }
      );
    }

    // Extract the image URL from the images array
    const userImage = vipPage.user.images[0]?.url || null;

    // Check if current user has an active subscription
    let hasActiveSubscription = false;
    const isOwnPage = currentUserId === vipPage.userId;

    if (currentUserId && !isOwnPage) {
      const subscription = await withRetry(() => prisma.vIPSubscription.findUnique({
        where: {
          subscriberId_vipPageId: {
            subscriberId: currentUserId,
            vipPageId: vipPage.id,
          },
        },
      }));

      hasActiveSubscription = subscription?.active === true && 
        (!subscription.expiresAt || subscription.expiresAt > new Date());
    }

    // Fetch content (either unlocked or preview)
    const canViewContent = isOwnPage || hasActiveSubscription || vipPage.isFree;

    // Build query for content with cursor-based pagination
    const contentQuery: any = {
      where: {
        vipPageId: vipPage.id,
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: currentUserId ? {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        } : false,
      },
      orderBy: {
        createdAt: 'desc' as const,
      },
      take: limit + 1, // Take one extra to determine if there are more
    };

    // Add cursor if provided
    if (cursor) {
      contentQuery.cursor = {
        id: cursor,
      };
      contentQuery.skip = 1; // Skip the cursor itself
    }

    const content = await withRetry(() => prisma.vIPContent.findMany(contentQuery));

    // Check if there are more items
    const hasMore = content.length > limit;
    const items = hasMore ? content.slice(0, limit) : content;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Get total likes across all content
    const totalLikes = await withRetry(() => prisma.vIPLike.count({
      where: {
        content: {
          vipPageId: vipPage.id,
        },
      },
    }));

    // Format content based on access
    const formattedContent = items.map((item: any) => {
      const isLiked = currentUserId && item.likes && item.likes.length > 0;
      
      if (!canViewContent) {
        // Return locked/preview version
        return {
          id: item.id,
          type: item.type,
          locked: true,
          likesCount: item._count.likes,
          commentsCount: item._count.comments,
          createdAt: item.createdAt,
          isLiked: false,
        };
      }

      // Return full content
      return {
        id: item.id,
        type: item.type,
        caption: item.caption,
        imageUrl: item.imageUrl,
        imageWidth: item.imageWidth,
        imageHeight: item.imageHeight,
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnailUrl,
        duration: item.duration,
        statusText: item.statusText,
        NSFW: item.NSFW,
        locked: false,
        likesCount: item._count.likes,
        commentsCount: item._count.comments,
        createdAt: item.createdAt,
        isLiked,
      };
    });

    // Get active discount offer
    const activeDiscount = vipPage.discountOffers[0] || null;

    return NextResponse.json({
      id: vipPage.id,
      title: vipPage.title,
      description: vipPage.description,
      bannerUrl: vipPage.bannerUrl,
      subscriptionPrice: vipPage.subscriptionPrice,
      isFree: vipPage.isFree,
      user: {
        id: vipPage.user.id,
        slug: vipPage.user.slug,
        bio: vipPage.user.bio,
        location: vipPage.user.location,
        suburb: vipPage.user.suburb,
        lastActive: vipPage.user.lastActive,
        createdAt: vipPage.user.createdAt,
        image: userImage,
      },
      hasActiveSubscription,
      isOwnPage,
      totalContent: vipPage._count.content,
      totalLikes,
      content: formattedContent,
      nextCursor,
      hasMore,
      activeDiscount: activeDiscount ? {
        discountPercent: activeDiscount.discountPercent,
        discountedPrice: activeDiscount.discountedPrice,
        validUntil: activeDiscount.validUntil,
      } : null,
    });

  } catch (error) {
    console.error('Error fetching VIP profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', fuckYou: error },
      { status: 500 }
    );
  }
}
