import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import {
  PrivateAdServiceCategory,
  PrivateAdDaysAvailable,
  PrivateAdExtraType,
  Race,
  BodyType,
  PrivateAdCustomerCategory,
} from "@prisma/client";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      services, // Array of { category, label?, options: [{ durationMin, price }] }
      extras, // Array of { name, price }
      daysAvailable,
      acceptsGender,
      acceptsRace,
      acceptsBodyType,
      acceptsAgeRange,
      active,
    } = body;

    // Validate required fields
    if (!title || !description || !services || services.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate that each service category is unique
    const serviceCategories = services.map((s: any) => s.category);
    const uniqueCategories = new Set(serviceCategories);
    if (serviceCategories.length !== uniqueCategories.size) {
      return NextResponse.json(
        { error: "Each service category can only be added once" },
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

    // Check if user already has an ad
    const existingAd = await withRetry(() =>
      prisma.privateAd.findUnique({
        where: { workerId: user.zesty_id },
        select: { id: true },
      })
    );

    if (existingAd) {
      // Update existing ad
      const updatedAd = await withRetry(() =>
        prisma.privateAd.update({
          where: { id: existingAd.id },
          data: {
            title,
            description,
            active: active ?? true,
            daysAvailable: daysAvailable || [],
            acceptsGender: acceptsGender || [],
            acceptsRace: acceptsRace || [],
            acceptsBodyType: acceptsBodyType || [],
            acceptsAgeRange: acceptsAgeRange || [18, 100],
            // Delete existing services and extras to recreate them
            services: {
              deleteMany: {},
            },
            extras: {
              deleteMany: {},
            },
          },
        })
      );

      // Create new services
      for (const service of services) {
        await withRetry(() =>
          prisma.privateAdService.create({
            data: {
              privateAdId: updatedAd.id,
              category: service.category as PrivateAdServiceCategory,
              label: service.label || null,
              options: {
                create: service.options.map((opt: any) => ({
                  durationMin: Number.parseInt(opt.durationMin),
                  price: Number.parseInt(opt.price),
                })),
              },
            },
          })
        );
      }

      // Create extras if provided
      if (extras && extras.length > 0) {
        await withRetry(() =>
          prisma.privateAdExtra.createMany({
            data: extras.map((extra: any) => ({
              privateAdId: updatedAd.id,
              name: extra.name as PrivateAdExtraType,
              price: Number.parseInt(extra.price),
              active: true,
            })),
          })
        );
      }

      // Fetch the complete updated ad
      const completeAd = await withRetry(() =>
        prisma.privateAd.findUnique({
          where: { id: updatedAd.id },
          include: {
            services: {
              include: {
                options: true,
              },
            },
            extras: true,
          },
        })
      );

      return NextResponse.json({ ad: completeAd });
    }

    // Create new ad
    const newAd = await withRetry(() =>
      prisma.privateAd.create({
        data: {
          workerId: user.zesty_id,
          title,
          description,
          active: active ?? true,
          daysAvailable: daysAvailable || [],
          acceptsGender: acceptsGender || [],
          acceptsRace: acceptsRace || [],
          acceptsBodyType: acceptsBodyType || [],
          acceptsAgeRange: acceptsAgeRange || [18, 100],
        },
      })
    );

    // Create services
    for (const service of services) {
      await withRetry(() =>
        prisma.privateAdService.create({
          data: {
            privateAdId: newAd.id,
            category: service.category as PrivateAdServiceCategory,
            label: service.label || null,
            options: {
              create: service.options.map((opt: any) => ({
                durationMin: Number.parseInt(opt.durationMin),
                price: Number.parseInt(opt.price),
              })),
            },
          },
        })
      );
    }

    // Create extras if provided
    if (extras && extras.length > 0) {
      await withRetry(() =>
        prisma.privateAdExtra.createMany({
          data: extras.map((extra: any) => ({
            privateAdId: newAd.id,
            name: extra.name as PrivateAdExtraType,
            price: Number.parseInt(extra.price),
            active: true,
          })),
        })
      );
    }

    // Fetch the complete ad
    const completeAd = await withRetry(() =>
      prisma.privateAd.findUnique({
        where: { id: newAd.id },
        include: {
          services: {
            include: {
              options: true,
            },
          },
          extras: true,
        },
      })
    );

    return NextResponse.json({ ad: completeAd }, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating ad:", error);
    return NextResponse.json(
      { error: "Failed to create/update ad" },
      { status: 500 }
    );
  }
}

// PATCH to toggle active status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { active } = body;

    if (active === undefined) {
      return NextResponse.json(
        { error: "Missing active field" },
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

    const ad = await withRetry(() =>
      prisma.privateAd.update({
        where: { workerId: user.zesty_id },
        data: { active },
        include: {
          services: {
            include: {
              options: true,
            },
          },
          extras: true,
        },
      })
    );

    return NextResponse.json({ ad });
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { error: "Failed to update ad" },
      { status: 500 }
    );
  }
}
