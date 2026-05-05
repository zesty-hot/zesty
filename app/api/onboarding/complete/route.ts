import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // form
    const formData = await request.formData();
    const dob = formData.get("dob") as string;
    const slug = formData.get("slug") as string;
    const image = formData.get("image") as File | null;
    const ethnicity = formData.get("ethnicity") as string;
    const gender = formData.get("gender") as string;
    const bodyType = formData.get("bodyType") as string;
    const suburb = formData.get("suburb") as string;

    if (!dob || !slug || !image || !ethnicity || !gender || !bodyType || !suburb) {
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

    if (existingUser) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 400 }
      );
    }

    // Upload image to Supabase Storage
    if (image) {
      const fileName = `${session.user.id}/${(new Date()).valueOf().toString()}`;
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supaBase.storage
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
      const { data: publicUrlData } = supaBase.storage
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
            user: { connect: { supabaseId: session.user.id } },
          },
        })
      );
    }

    // Update user profile (DO NOT touch user.image)
    await withRetry(() =>
      prisma.user.update({
        where: { supabaseId: session.user.id },
        data: {
          dob: dobDate,
          slug: slug.toLowerCase(),
          race: ethnicity as any, // ASIAN, AFRICAN, HISPANIC, WHITE, DESI, ARABIC
          gender: gender as any, // MALE, FEMALE, TRANS
          bodyType: bodyType as any, // REGULAR, PLUS, ATHLETE
          suburb: suburb,
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
