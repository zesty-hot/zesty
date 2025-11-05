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
      include: {
        services: true,
        worker: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!ad || !ad.active) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Format the response to match the ProfileData interface
    const profile = {
      id: ad.id,
      adId: ad.id,
      slug: ad.worker.slug || ad.worker.name || 'Unknown',
      location: ad.worker.suburb || 'Unknown location',
      price: ad.services[0]?.price ? `$${ad.services[0].price}` : 'Contact for price',
      age: ad.worker.dob ? calculateAge(ad.worker.dob) : 0,
      gender: ad.worker.gender || 'FEMALE',
      bodyType: ad.worker.bodyType || 'REGULAR',
      race: ad.worker.race || 'WHITE',
      images: ad.worker.images.map(img => ({ url: img.url, default: img.default })),
      services: ad.services,
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