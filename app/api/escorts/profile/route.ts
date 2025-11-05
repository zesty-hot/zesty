import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/calculate-age";

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    const ad = await prisma.privateAd.findFirst({
      where: {
        worker: {
          slug: slug
        },
        active: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        services: {
          include: {
            options: {
              orderBy: { price: 'asc' }
            },
          }
        },
        acceptsGender: true,
        acceptsRace: true,
        acceptsBodyType: true,
        acceptsAgeRange: true,
        daysAvailable: true,
        extras: true,
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

    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
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
      slug: ad.worker.slug || ad.title || 'Unknown',
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
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}