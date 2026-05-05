import { serverSupabase } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { withRetry, prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();

  if (!session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const favourites = await withRetry(() => prisma.privateAd.findMany({
    where: {
      followers: {
        some: {
          supabaseId: session.user.id
        }
      }
    },
    include: {
      worker: true
    }
  }));

  return NextResponse.json({ favourites });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug } = body;

  if (!slug) {
    return NextResponse.json(
      { error: "Missing escortId field" },
      { status: 400 }
    );
  }

  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();

  if (!session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const ad = await withRetry(() => prisma.privateAd.findFirst({
    where: {
      worker: {
        slug: slug
      }
    },
    include: {
      worker: true,
      followers: {
        where: {
          supabaseId: session.user.id
        }
      }
    }
  }));


  if (!ad) {
    return NextResponse.json(
      { error: "Escort not found" },
      { status: 404 }
    );
  }

  if (ad.followers.length > 0) {
    // Already favourited, so unfavourite
    try {
      await withRetry(() => prisma.privateAd.update({
        where: { workerId: ad.worker.zesty_id },
        data: {
          followers: {
            disconnect: { supabaseId: session.user.id }
          }
        }
      }));
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to unfavourite escort" },
        { status: 500 }
      );
    }
  } else {
    // Not favourited, so favourite
    try {
      await withRetry(() => prisma.privateAd.update({
        where: { workerId: ad.worker.zesty_id },
        data: {
          followers: {
            connect: { supabaseId: session.user.id }
          }
        }
      }));
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to favourite escort" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}