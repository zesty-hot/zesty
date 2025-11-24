import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cursor, limit = 8 } = body;
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();


    // If user is logged in, fetch their subscription feed
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

      if (subscribedPageIds.length === 0) {
        // User has no subscriptions
        return NextResponse.json({
          isLoggedIn: true,
          content: [],
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
                  id: true,
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
            where: { userId: user.zesty_id },
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
          id: item.vipPage.user.id,
          slug: item.vipPage.user.slug,
          image: item.vipPage.user.images?.[0]?.url || null,
        }
      }));

      return NextResponse.json({
        isLoggedIn: true,
        content: formattedContent,
        nextCursor,
        hasMore,
      });
    }

    // If user is not logged in, fetch featured creators with randomization
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

    // If we have more than 8 pages, randomize which ones to show
    let featuredPages;
    if (totalPages > 8) {
      // Get random offset
      const randomOffset = Math.floor(Math.random() * Math.max(0, totalPages - 8));

      featuredPages = await withRetry(() =>
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
          skip: randomOffset,
          take: 8,
        })
      );
    } else {
      // If 8 or fewer, just return all of them
      featuredPages = await withRetry(() =>
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
          take: 8,
        })
      );
    }

    const featuredCreators = featuredPages.map((page: any) => ({
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
