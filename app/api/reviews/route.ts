import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma, withRetry } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await req.json();
    const { offerId, rating, comment } = body;

    if (!offerId || !rating) {
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

    // Get the offer and verify the user is the client
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

    if (offer.clientId !== userId) {
      return NextResponse.json(
        { error: "Only the client can leave a review" },
        { status: 403 }
      );
    }

    if (offer.status !== "CONFIRMED" && offer.status !== "RELEASED") {
      return NextResponse.json(
        { error: "Can only review confirmed or completed offers" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await withRetry(() =>
      prisma.review.findFirst({
        where: {
          offerId: offerId,
          reviewerId: userId,
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
          reviewerId: userId,
          revieweeId: offer.workerId,
          offerId: offerId,
          rating: Number.parseInt(rating),
          comment: comment || null,
        },
        include: {
          reviewer: {
            select: {
              id: true,
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
