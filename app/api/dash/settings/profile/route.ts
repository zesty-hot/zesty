import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await serverSupabase();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await withRetry(() =>
      prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: {
          zesty_id: true,
          slug: true,
          bio: true,
          suburb: true,
          images: {
            orderBy: { default: "desc" }, // Default image first
            select: {
              id: true,
              url: true,
              width: true,
              height: true,
              default: true,
            },
          },
        },
      })
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await serverSupabase();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const bio = formData.get("bio") as string;
    const suburb = formData.get("suburb") as string;
    const slug = formData.get("slug") as string;

    const deletedImageIdsRaw = formData.get("deletedImageIds") as string;
    const deletedImageIds = deletedImageIdsRaw ? JSON.parse(deletedImageIdsRaw) : [];

    const defaultImageId = formData.get("defaultImageId") as string;

    const newImagesMetadataRaw = formData.get("newImagesMetadata") as string;
    const newImagesMetadata = newImagesMetadataRaw ? JSON.parse(newImagesMetadataRaw) : [];

    const newImageFiles = formData.getAll("newImages") as File[];

    // Validation
    if (slug) {
      if (slug.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters" },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
        return NextResponse.json(
          {
            error:
              "Username can only contain letters, numbers, hyphens, and underscores",
          },
          { status: 400 }
        );
      }

      // Check uniqueness if slug changed
      const currentUser = await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { slug: true },
      });

      if (currentUser?.slug !== slug) {
        const existingUser = await prisma.user.findUnique({
          where: { slug: slug.toLowerCase() },
        });
        if (existingUser) {
          return NextResponse.json(
            { error: "Username is already taken" },
            { status: 400 }
          );
        }
      }
    }

    // Upload new images to Supabase Storage
    const uploadedImages: { url: string; width: number; height: number; isDefault: boolean }[] = [];
    if (newImageFiles.length > 0) {
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        const metadata = newImagesMetadata[i] || { isDefault: false };

        const fileName = `${authUser.id}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
          .from("profile-images")
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          console.error("Image upload error:", error);
          // Continue with other images or fail? Let's fail for now to be safe
          throw new Error("Failed to upload image");
        }

        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(data.path);

        uploadedImages.push({
          url: publicUrlData.publicUrl,
          width: 800, // Placeholder
          height: 800, // Placeholder
          isDefault: metadata.isDefault,
        });
      }
    }

    // Transaction to handle all updates
    await prisma.$transaction(async (tx) => {
      // 1. Update User details
      await tx.user.update({
        where: { supabaseId: authUser.id },
        data: {
          bio,
          suburb,
          slug: slug ? slug.toLowerCase() : undefined,
        },
      });

      // 2. Delete removed images
      if (deletedImageIds && deletedImageIds.length > 0) {
        // Verify images belong to user before deleting
        await tx.images.deleteMany({
          where: {
            id: { in: deletedImageIds },
            user: { supabaseId: authUser.id },
          },
        });
      }

      // 3. Add new images
      if (uploadedImages.length > 0) {
        for (const img of uploadedImages) {
          await tx.images.create({
            data: {
              url: img.url,
              width: img.width,
              height: img.height,
              user: { connect: { supabaseId: authUser.id } },
              default: img.isDefault || false,
            },
          });
        }
      }

      // 4. Update default image (for existing images)
      if (defaultImageId) {
        // First unset all defaults for this user
        await tx.images.updateMany({
          where: { user: { supabaseId: authUser.id } },
          data: { default: false },
        });

        // Set new default
        await tx.images.update({
          where: { id: defaultImageId },
          data: { default: true },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
