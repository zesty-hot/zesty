import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await withRetry(() => prisma.user.findUnique({
    where: { supabaseId: session.user.id },
    include: { vipPage: true }
  }));

  if (!user || !user.vipPage) {
    return NextResponse.json({ error: 'VIP page not found' }, { status: 404 });
  }

  const content = await withRetry(() => prisma.vIPContent.findMany({
    where: { vipPageId: user.vipPage!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  }));

  return NextResponse.json(content);
}

export async function POST(req: NextRequest) {
  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { type, caption, imageUrl, videoUrl, statusText, NSFW } = body;

  const user = await withRetry(() => prisma.user.findUnique({
    where: { supabaseId: session.user.id },
    include: { vipPage: true }
  }));

  if (!user || !user.vipPage) {
    return NextResponse.json({ error: 'VIP page not found' }, { status: 404 });
  }

  const newContent = await withRetry(() => prisma.vIPContent.create({
    data: {
      vipPageId: user.vipPage!.id,
      type,
      caption,
      imageUrl,
      videoUrl,
      statusText,
      NSFW: NSFW || false,
    }
  }));

  return NextResponse.json(newContent);
}
