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
        services: true,
        worker: {
          select: {
            id: true,
            slug: true,
            dob: true,
            gender: true,
            bodyType: true,
            race: true,
            name: false,
            suburb: true,
            location: true,
            image: true,
            images: {
              select: { url: true, default: true },
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
    
    // Format pricing from service price range
    let priceText = 'Contact for rates';
    if (ad.services.length > 0) {
      const prices = ad.services.map(s => s.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        priceText = `$${minPrice}`;
      } else {
        priceText = `$${minPrice} - $${maxPrice}`;
      }
    }

    // Format the response
    const profile = {
      id: ad.worker.id,
      adId: ad.id,
      slug: ad.worker.slug || ad.title || 'Featured Profile',
      location: ad.worker.suburb || 'Unknown location',
      price: priceText,
      images: ad.worker.images.length > 0 
        ? ad.worker.images.map(img => ({ url: img.url, default: img.default })) 
        : ad.worker.image 
          ? [ad.worker.image] 
          : ['/placeholder.jpg'],
      services: ad.services,
      age: ad.worker.dob ? calculateAge(ad.worker.dob) : 0,
      gender: ad.worker.gender || 'FEMALE',
      bodyType: ad.worker.bodyType || 'REGULAR',
      race: ad.worker.race || 'WHITE',
    };
    
    return NextResponse.json(profile);
    
  } catch (error) {
    console.error('Error fetching featured profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
