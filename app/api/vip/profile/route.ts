import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ ok: false, message: 'Failed to parse JSON body', error: String(err) }, { status: 400 });
    }

    const { slug, cursor, limit = 20 } = body;
    if (!slug) {
      return NextResponse.json({ ok: false, message: 'Slug is required' }, { status: 400 });
    }

    const decodedSlug = decodeURIComponent(slug);

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    // Step 4: fetch VIP page
    let vipPage = await withRetry(() => prisma.vIPPage.findFirst({
      where: {
        user: { slug: decodedSlug },
        active: true,
      },
      include: {
        user: {
          select: {
            zesty_id: true,
            title: true,
            slug: true,
            bio: true,
            location: true,
            suburb: true,
            verified: true,
            lastActive: true,
            createdAt: true,
            images: {
              where: { default: true },
              select: { url: true },
              take: 1,
            },
          },
        },
        discountOffers: {
          where: {
            active: true,
            validFrom: { lte: new Date() },
            OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { content: true } },
      },
    }));

    if (!vipPage) {
      return NextResponse.json({ step: 4, ok: false, message: 'VIP page not found' }, { status: 404 });
    }

    // Step 5: resolve user image (from images relation)
    let userImage: string | null = null;
    try {
      userImage = vipPage.user?.images?.[0]?.url ?? null;
    } catch (err) {
      return NextResponse.json({ step: 5, ok: false, message: 'extracting user image failed', error: String(err) }, { status: 500 });
    }

    // Step 6: check subscription
    let user: { zesty_id: string } | null = null;
    if (session.user) {
      user = await withRetry(() => prisma.user.findUnique({
        where: { supabaseId: session?.user?.id },
        select: { zesty_id: true },
      }));
    }

    let isOwnPage: boolean = false;
    if (user?.zesty_id) {
      isOwnPage = user?.zesty_id === vipPage.zesty_id;
    }

    let hasActiveSubscription = false;
    if (user?.zesty_id && !isOwnPage) {
      try {
        const subscription = await withRetry(() => prisma.vIPSubscription.findUnique({
          where: { subscriberId_vipPageId: { subscriberId: user.zesty_id, vipPageId: vipPage.id } },
        }));
        hasActiveSubscription = subscription?.active === true && (!subscription.expiresAt || subscription.expiresAt > new Date());
      } catch (err) {
        return NextResponse.json({ step: 6, ok: false, message: 'subscription check failed', error: String(err) }, { status: 500 });
      }
    }

    // Step 7: fetch content
    let content: any[] = [];
    try {
      const contentQuery: any = {
        where: { vipPageId: vipPage.id },
        include: {
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: user?.zesty_id ? { where: { zesty_id: user.zesty_id }, select: { id: true } } : false
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      };
      if (cursor) { contentQuery.cursor = { id: cursor }; contentQuery.skip = 1; }
      const raw = await withRetry(() => prisma.vIPContent.findMany(contentQuery));
      content = raw;
    } catch (err) {
      return NextResponse.json({ step: 7, ok: false, message: 'fetching content failed', error: String(err) }, { status: 500 });
    }

    // Check if there are more items
    const hasMore = content.length > limit;
    const items = hasMore ? content.slice(0, limit) : content;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Get total likes across all content
    const totalLikes = await withRetry(() => prisma.vIPLike.count({ where: { content: { vipPageId: vipPage.id } } }));

    // Check if user has active escort profile
    const hasActiveEscort = await withRetry(() => prisma.privateAd.findFirst({
      where: {
        workerId: vipPage.zesty_id,
        active: true,
      },
      select: { id: true },
    }));

    // Check if user has active live stream page
    const hasActiveLive = await withRetry(() => prisma.liveStreamPage.findFirst({
      where: {
        zesty_id: vipPage.zesty_id,
        active: true,
      },
      select: {
        id: true,
        streams: {
          where: { isLive: true },
          select: {
            id: true,
            title: true,
            roomName: true,
            viewerCount: true,
            startedAt: true,
            isLive: true,
          },
          take: 1,
        },
      },
    }));

    const isLive = (hasActiveLive?.streams && hasActiveLive.streams.length > 0 && hasActiveLive.streams[0].isLive) || false;

    const canViewContent = isOwnPage || hasActiveSubscription || vipPage.isFree;

    const formattedContent = items.map((item: any) => {
      const isLiked = user?.zesty_id && item.likes && item.likes.length > 0;
      if (!canViewContent) {
        return { id: item.id, type: item.type, locked: true, likesCount: item._count.likes, commentsCount: item._count.comments, createdAt: item.createdAt, isLiked: false };
      }
      return { id: item.id, type: item.type, caption: item.caption, imageUrl: item.imageUrl, imageWidth: item.imageWidth, imageHeight: item.imageHeight, videoUrl: item.videoUrl, thumbnailUrl: item.thumbnailUrl, duration: item.duration, statusText: item.statusText, NSFW: item.NSFW, locked: false, likesCount: item._count.likes, commentsCount: item._count.comments, createdAt: item.createdAt, isLiked };
    });

    const activeDiscount = vipPage.discountOffers?.[0] || null;

    return NextResponse.json({
      id: vipPage.id,
      title: vipPage.user.title || vipPage.user.slug,
      description: vipPage.description,
      bannerUrl: vipPage.bannerUrl,
      subscriptionPrice: vipPage.subscriptionPrice,
      isFree: vipPage.isFree,
      user: { id: vipPage.user.zesty_id, slug: vipPage.user.slug, bio: vipPage.user.bio, location: vipPage.user.location, suburb: vipPage.user.suburb, verified: vipPage.user.verified, lastActive: vipPage.user.lastActive, createdAt: vipPage.user.createdAt, image: userImage },
      hasActiveSubscription,
      isOwnPage,
      totalContent: vipPage._count.content,
      totalLikes,
      content: formattedContent,
      nextCursor,
      hasMore,
      activeDiscount: activeDiscount ? { discountPercent: activeDiscount.discountPercent, discountedPrice: activeDiscount.discountedPrice, validUntil: activeDiscount.validUntil } : null,
      hasActiveEscort: !!hasActiveEscort,
      liveStreamPage: hasActiveLive?.id ? true : false,
      isLive,
    });

  } catch (error) {
    console.error('Error fetching VIP profile (final catch):', error);
    return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
  }
}
