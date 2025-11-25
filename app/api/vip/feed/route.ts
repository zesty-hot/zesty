import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cursor, limit = 8 } = body;
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();


    // Helper to fetch featured creators
    const getFeaturedCreators = async () => {
      // First get the total count
      const totalPages = await withRetry(() =>
        prisma.vIPPage.count({
          where: {
            active: true,
            OR: [
              { isFree: true },
              {
                content: {
                  some: {}
                }
              }
            ]
          }
        })
      );

      // Determine how many to fetch and where to start
      // We fetch up to 50 to allow for better shuffling
      const takeCount = 50;
      let skipCount = 0;

      if (totalPages > takeCount) {
        skipCount = Math.floor(Math.random() * (totalPages - takeCount));
      }

      const rawPages = await withRetry(() =>
        prisma.vIPPage.findMany({
          where: {
            active: true,
            OR: [
              { isFree: true },
              {
                content: {
                  some: {}
                }
              }
            ]
          },
          select: {
            id: true,
            description: true,
            isFree: true,
            subscriptionPrice: true,
            user: {
              select: {
                zesty_id: true,
                title: true,
                slug: true,
                verified: true,
                images: {
                  where: { default: true },
                  select: { url: true, NSFW: true },
                  take: 1,
                }
              }
            },
            _count: {
              select: {
                content: true,
                subscriptions: {
                  where: {
                    active: true,
                    OR: [
                      { expiresAt: null },
                      { expiresAt: { gte: new Date() } }
                    ]
                  }
                }
              }
            }
          },
          orderBy: [
            { isFree: 'desc' as const },
            { createdAt: 'desc' as const }
          ],
          skip: skipCount,
          take: takeCount,
        })
      );

      // Shuffle the results in memory
      const shuffled = [...rawPages].sort(() => 0.5 - Math.random());

      // Take the top 8
      const selectedPages = shuffled.slice(0, 8);

      return selectedPages.map((page: any) => ({
        id: page.id,
        slug: page.user.slug || '',
        image: page.user.images?.[0] || null,
        title: page.user.title || page.user.slug,
        description: page.description,
        subscribersCount: page._count.subscriptions,
        contentCount: page._count.content,
        isFree: page.isFree,
        price: page.subscriptionPrice,
      }));
    };

    // If user is logged in, fetch their subscription feed AND featured creators
    if (session?.user?.id) {
      let user = await withRetry(() =>
        prisma.user.findUnique({
          where: {
            supabaseId: session?.user?.id,
          },
          select: { zesty_id: true },
        })
      );

      if (!user) {
        return NextResponse.json({ error: "Account not found" }, { status: 401 });
      }

      // Fetch featured creators in parallel
      const featuredCreatorsPromise = getFeaturedCreators();

      // Get user's active subscriptions
      const subscriptions = await withRetry(() =>
        prisma.vIPSubscription.findMany({
          where: {
            subscriberId: user.zesty_id,
            active: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          },
          select: {
            vipPageId: true,
          }
        })
      );

      const subscribedPageIds = subscriptions.map(sub => sub.vipPageId);
      const featuredCreators = await featuredCreatorsPromise;

      if (subscribedPageIds.length === 0) {
        // User has no subscriptions
        return NextResponse.json({
          isLoggedIn: true,
          content: [],
          featuredCreators,
          nextCursor: null,
          hasMore: false,
        });
      }

      // Fetch content from subscribed pages
      const contentQuery: any = {
        where: {
          vipPageId: { in: subscribedPageIds },
        },
        include: {
          vipPage: {
            select: {
              user: {
                select: {
                  zesty_id: true,
                  slug: true,
                  images: {
                    where: { default: true },
                    select: { url: true },
                    take: 1,
                  }
                }
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          },
          likes: {
            where: { zesty_id: user.zesty_id },
            select: { id: true },
          }
        },
        orderBy: { createdAt: 'desc' as const },
        take: limit + 1,
      };

      if (cursor) {
        contentQuery.cursor = { id: cursor };
        contentQuery.skip = 1;
      }

      const rawContent = await withRetry(() =>
        prisma.vIPContent.findMany(contentQuery)
      );

      const hasMore = rawContent.length > limit;
      const items = hasMore ? rawContent.slice(0, limit) : rawContent;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      const formattedContent = items.map((item: any) => ({
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
        likesCount: item._count.likes,
        commentsCount: item._count.comments,
        createdAt: item.createdAt,
        isLiked: item.likes && item.likes.length > 0,
        creator: {
          id: item.vipPage.user.zesty_id,
          slug: item.vipPage.user.slug,
          image: item.vipPage.user.images?.[0]?.url || null,
        }
      }));

      return NextResponse.json({
        isLoggedIn: true,
        content: formattedContent,
        featuredCreators,
        nextCursor,
        hasMore,
      });
    }

    // If user is not logged in, fetch featured creators with randomization
    const featuredCreators = await getFeaturedCreators();

    return NextResponse.json({
      isLoggedIn: false,
      featuredCreators,
    });

  } catch (error) {
    console.error('Error fetching VIP feed:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 }
    );
  }
}
