import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/prisma";
import { serverSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { revieweeId, offerId, rating, comment } = body;

    // Validate required fields
    if (!revieweeId || !offerId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user?.id },
      select: { zesty_id: true },
    }));

    // Verify the offer exists and is in CONFIRMED or RELEASED status
    const offer = await withRetry(() =>
      prisma.privateOffer.findUnique({
        where: { id: offerId },
        select: {
          id: true,
          clientId: true,
          workerId: true,
          status: true,
        },
      })
    );

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Verify the user is the client of this offer
    if (offer.clientId !== user?.zesty_id) {
      return NextResponse.json(
        { error: "You can only review offers you are the client of" },
        { status: 403 }
      );
    }

    // Verify the worker is the reviewee
    if (offer.workerId !== revieweeId) {
      return NextResponse.json(
        { error: "Worker does not match the offer" },
        { status: 400 }
      );
    }

    // Only allow reviews for CONFIRMED or RELEASED offers
    if (offer.status !== "CONFIRMED" && offer.status !== "RELEASED") {
      return NextResponse.json(
        { error: "Can only review confirmed or completed offers" },
        { status: 400 }
      );
    }

    // Check if review already exists for this offer
    const existingReview = await withRetry(() =>
      prisma.review.findFirst({
        where: {
          offerId,
          reviewerId: user.zesty_id,
        },
      })
    );

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this offer" },
        { status: 400 }
      );
    }

    // Create the review
    const review = await withRetry(() =>
      prisma.review.create({
        data: {
          reviewerId: user.zesty_id,
          revieweeId,
          offerId,
          rating: Number.parseInt(rating),
          comment: comment?.trim() || null,
        },
        include: {
          reviewer: {
            select: {
              zesty_id: true,
              slug: true,
              verified: true,
              images: {
                where: { default: true },
                select: { url: true },
              },
            },
          },
          reviewee: {
            select: {
              zesty_id: true,
              slug: true,
              verified: true,
              images: {
                where: { default: true },
                select: { url: true },
              },
            },
          },
        },
      })
    );

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// Get reviews for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    // Fetch reviews received by this user
    const reviews = await withRetry(() =>
      prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: {
            select: {
              zesty_id: true,
              slug: true,
              verified: true,
              images: {
                where: { default: true },
                select: { url: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    );

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
