import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateAge } from '@/lib/calculate-age';

export async function GET() {
  try {
    // Get total count of ACTIVE PrivateAds
    const totalAds = await prisma.privateAd.count({
      where: {
        active: true
      }
    });

    if (totalAds === 0) {
      return NextResponse.json(
        { error: 'No active ads available' },
        { status: 404 }
      );
    }

    // Generate a random offset
    const randomOffset = Math.floor(Math.random() * totalAds);

    // Fetch one random ACTIVE PrivateAd with its worker (user) and images
    const ad = await prisma.privateAd.findFirst({
      skip: randomOffset,
      where: {
        active: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        acceptsGender: true,
        acceptsRace: true,
        acceptsBodyType: true,
        acceptsAgeRange: true,
        daysAvailable: true,
        extras: true,
        services: {
          include: {
            options: {
              orderBy: { price: 'asc' }
            },
          }
        },
        worker: {
          select: {
            name: false,
            image: false,

            id: true,
            slug: true,
            dob: true,
            gender: true,
            bodyType: true,
            race: true,
            suburb: true,
            location: true,
            lastActive: true,
            images: {
              select: { url: true, default: true, NSFW: true },
              // TODO: select 6 random images but always take 1 default if exists
              take: 6 // Get up to 6 images for the featured section
            }
          }
        }
      }
    });

    if (!ad || !ad.worker) {
      return NextResponse.json(
        { error: 'No ad found' },
        { status: 404 }
      );
    }

    const averageRating = await prisma.review.aggregate({
      where: {
        revieweeId: ad.worker.id
      },
      _avg: {
        rating: true
      }
    });

    // Format pricing from service price range
    let priceText = 'Contact for rates';
    if (ad.services.length > 0) {
      const prices = ad.services.map(s => s.options.map(o => o.price)).flat();
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        priceText = `$${minPrice}`;
      } else {
        priceText = `$${minPrice} - $${maxPrice}`;
      }
    }

    // convert lastActive to 1hr/2hr...1 day/2days ago
    const timeAgo = (date: Date) => {
      const now = new Date();
      const diff = Math.abs(now.getTime() - date.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
      if (hours <= 1) {
        return 'Just now';
      }
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    };

    // Format the response
    const profile = {
      ad: ad,
      slug: ad.worker.slug || ad.title || 'Featured Profile',
      location: ad.worker.suburb || 'Unknown location',
      price: priceText,
      age: ad.worker.dob ? calculateAge(ad.worker.dob) : -1,
      gender: ad.worker.gender || 'FEMALE',
      bodyType: ad.worker.bodyType || 'REGULAR',
      race: ad.worker.race || 'WHITE',
      images: ad.worker.images.map(img => ({ url: img.url, default: img.default, NSFW: img.NSFW })),
      lastActive: ad.worker.lastActive ? timeAgo(ad.worker.lastActive) : 'Inactive',
      averageRating: averageRating._avg.rating ? parseFloat(averageRating._avg.rating.toFixed(2)) : 0
    };

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
