import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

// DEBUG MODE: This route will return an explicit message after each major step.
// We'll progressively enable the next step once the previous step is confirmed working in the deployed environment.

export async function POST(req: NextRequest) {
  try {
    // Step 1: parse body
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ step: 1, ok: false, message: 'Failed to parse JSON body', error: String(err) }, { status: 400 });
    }

    const { slug, cursor, limit = 20 } = body;
    if (!slug) {
      return NextResponse.json({ step: 1, ok: false, message: 'Slug is required' }, { status: 400 });
    }

    // Return success for step 1 so we can deploy and verify parsing works on Vercel
    if (body.__debug_step === 1) {
      return NextResponse.json({ step: 1, ok: true, message: 'Parsed body OK', slug });
    }

    // Step 2: get current user
    let currentUser: any = null;
    try {
      currentUser = await getCurrentUser();
    } catch (err) {
      // In production, if session check fails, just proceed without user (public view)
      console.error('getCurrentUser failed, proceeding as unauthenticated:', err);
      currentUser = null;
    }

    // Early return for step 2
    if (body.__debug_step === 2) {
      return NextResponse.json({ step: 2, ok: true, message: 'getCurrentUser OK (or bypassed)', currentUser: currentUser ? { id: currentUser.id ?? null, email: currentUser.email ?? null } : null });
    }

    // Step 3: find currentUserId (if any)
    let currentUserId: string | undefined = undefined;
    try {
      if (currentUser?.email) {
        const found = await withRetry(() => prisma.user.findUnique({ where: { email: currentUser.email } }));
        currentUserId = found?.id;
      }
    } catch (err) {
      console.error('finding current user in DB failed, proceeding without userId:', err);
      currentUserId = undefined;
    }

    if (body.__debug_step === 3) {
      return NextResponse.json({ step: 3, ok: true, message: 'resolved currentUserId (or bypassed)', currentUserId });
    }

    // Step 4: fetch VIP page
    let vipPage: any = null;
    try {
      vipPage = await withRetry(() => prisma.vIPPage.findFirst({
        where: {
          user: { slug },
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
              OR: [ { validUntil: null }, { validUntil: { gte: new Date() } } ],
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: { select: { content: true } },
        },
      }));
    } catch (err) {
      return NextResponse.json({ step: 4, ok: false, message: 'prisma.vIPPage.findFirst failed', error: String(err) }, { status: 500 });
    }

    if (!vipPage) {
      return NextResponse.json({ step: 4, ok: false, message: 'VIP page not found' }, { status: 404 });
    }

    if (body.__debug_step === 4) {
      return NextResponse.json({ step: 4, ok: true, message: 'vipPage fetched', vipPage: { id: vipPage.id, userId: vipPage.userId } });
    }

    // Step 5: resolve user image (from images relation)
    let userImage: string | null = null;
    try {
      userImage = vipPage.user?.images?.[0]?.url ?? null;
    } catch (err) {
      return NextResponse.json({ step: 5, ok: false, message: 'extracting user image failed', error: String(err) }, { status: 500 });
    }

    if (body.__debug_step === 5) {
      return NextResponse.json({ step: 5, ok: true, message: 'userImage resolved', userImage });
    }

    // If debug headers requested to stop here, return success summary
    if (body.__debug_stop_after) {
      return NextResponse.json({ ok: true, message: 'stopped after image resolution', vipPageId: vipPage.id, userImage });
    }

    // --- From here on we can progressively enable more steps once above steps succeed in prod ---

    // Step 6: check subscription
    let hasActiveSubscription = false;
    const isOwnPage = currentUserId === vipPage.userId;

    if (currentUserId && !isOwnPage) {
      try {
        const subscription = await withRetry(() => prisma.vIPSubscription.findUnique({
          where: { subscriberId_vipPageId: { subscriberId: currentUserId, vipPageId: vipPage.id } },
        }));
        hasActiveSubscription = subscription?.active === true && (!subscription.expiresAt || subscription.expiresAt > new Date());
      } catch (err) {
        return NextResponse.json({ step: 6, ok: false, message: 'subscription check failed', error: String(err) }, { status: 500 });
      }
    }

    if (body.__debug_step === 6) {
      return NextResponse.json({ step: 6, ok: true, message: 'subscription checked', hasActiveSubscription, isOwnPage });
    }

    // Step 7: fetch content
    let content: any[] = [];
    try {
      const contentQuery: any = {
        where: { vipPageId: vipPage.id },
        include: { _count: { select: { likes: true, comments: true } }, likes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      };
      if (cursor) { contentQuery.cursor = { id: cursor }; contentQuery.skip = 1; }
      const raw = await withRetry(() => prisma.vIPContent.findMany(contentQuery));
      content = raw;
    } catch (err) {
      return NextResponse.json({ step: 7, ok: false, message: 'fetching content failed', error: String(err) }, { status: 500 });
    }

    if (body.__debug_step === 7) {
      return NextResponse.json({ step: 7, ok: true, message: 'content fetched', count: content.length, sample: content.slice(0,2).map(c => ({ id: c.id, type: c.type })) });
    }

    // At this point, if no debug flags provided, continue and return the normal response
    // Check if there are more items
    const hasMore = content.length > limit;
    const items = hasMore ? content.slice(0, limit) : content;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Get total likes across all content
    const totalLikes = await withRetry(() => prisma.vIPLike.count({ where: { content: { vipPageId: vipPage.id } } }));

    // Check if user has active escort profile
    const hasActiveEscort = await withRetry(() => prisma.privateAd.findFirst({
      where: {
        workerId: vipPage.userId,
        active: true,
      },
      select: { id: true },
    }));

    // Check if user has active live stream page
    const hasActiveLive = await withRetry(() => prisma.liveStreamPage.findFirst({
      where: {
        userId: vipPage.userId,
      },
      select: { id: true },
    }));

    const canViewContent = isOwnPage || hasActiveSubscription || vipPage.isFree;

    const formattedContent = items.map((item: any) => {
      const isLiked = currentUserId && item.likes && item.likes.length > 0;
      if (!canViewContent) {
        return { id: item.id, type: item.type, locked: true, likesCount: item._count.likes, commentsCount: item._count.comments, createdAt: item.createdAt, isLiked: false };
      }
      return { id: item.id, type: item.type, caption: item.caption, imageUrl: item.imageUrl, imageWidth: item.imageWidth, imageHeight: item.imageHeight, videoUrl: item.videoUrl, thumbnailUrl: item.thumbnailUrl, duration: item.duration, statusText: item.statusText, NSFW: item.NSFW, locked: false, likesCount: item._count.likes, commentsCount: item._count.comments, createdAt: item.createdAt, isLiked };
    });

    const activeDiscount = vipPage.discountOffers?.[0] || null;

    return NextResponse.json({ id: vipPage.id, title: vipPage.title, description: vipPage.description, bannerUrl: vipPage.bannerUrl, subscriptionPrice: vipPage.subscriptionPrice, isFree: vipPage.isFree, user: { id: vipPage.user.id, slug: vipPage.user.slug, bio: vipPage.user.bio, location: vipPage.user.location, suburb: vipPage.user.suburb, lastActive: vipPage.user.lastActive, createdAt: vipPage.user.createdAt, image: userImage }, hasActiveSubscription, isOwnPage, totalContent: vipPage._count.content, totalLikes, content: formattedContent, nextCursor, hasMore, activeDiscount: activeDiscount ? { discountPercent: activeDiscount.discountPercent, discountedPrice: activeDiscount.discountedPrice, validUntil: activeDiscount.validUntil } : null, hasActiveEscort: !!hasActiveEscort, hasActiveLive });

  } catch (error) {
    console.error('Error fetching VIP profile (final catch):', error);
    return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
  }
}
