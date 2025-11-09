import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const formData = await request.formData();
    const dob = formData.get("dob") as string;
    const slug = formData.get("slug") as string;
    const image = formData.get("image") as File | null;

    // Validate required fields
    if (!dob || !slug || !image) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate date of birth (must be 18+)
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { message: "You must be at least 18 years old" },
        { status: 400 }
      );
    }

    // Validate slug format
    if (slug.length < 3) {
      return NextResponse.json(
        { message: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return NextResponse.json(
        { message: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingUser = await withRetry(() =>
      prisma.user.findUnique({
        where: { slug: slug.toLowerCase() },
      })
    );

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    // Upload image to Supabase Storage
    if (image) {
      const fileName = `${userId}/${(new Date()).valueOf().toString()}`;
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, buffer, {
          contentType: image.type,
          upsert: false,
        });

      if (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
          { message: "Failed to upload image" },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(data.path);

      const imageUrl = publicUrlData.publicUrl;

      // Get image dimensions (approximate - you may want to use a library for this)
      const width = 800;
      const height = 800;

      // Create Images record with default = true
      await withRetry(() =>
        prisma.images.create({
          data: {
            url: imageUrl,
            width: width,
            height: height,
            altText: `${slug}'s profile photo`,
            default: true,
            NSFW: false,
            userId: userId,
          },
        })
      );
    }

    // Update user profile (DO NOT touch user.image)
    await withRetry(() =>
      prisma.user.update({
        where: { id: userId },
        data: {
          dob: dobDate,
          slug: slug.toLowerCase(),
          onboardingCompleted: true,
        },
      })
    );

    return NextResponse.json(
      { message: "Onboarding completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
