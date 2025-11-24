import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();

  const user = await withRetry(() => prisma.user.findUnique({
    where: { supabaseId: session?.user?.id },
    include: {
      vipPage: true
    }
  }));

  if (!user) {
    return NextResponse.json({ ok: false, message: 'User not found' }, { status: 404 });
  }

  if (!user.vipPage) {
    return NextResponse.json({ ok: false, }, { status: 404 });
  }

  return NextResponse.json(user.vipPage, { status: 200 });
}

export async function PATCH(req: NextRequest) {
  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();
  const body = await req.json();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const user = await withRetry(() => prisma.user.findFirst({
    where: { supabaseId: session.user.id },
    include: {
      vipPage: true
    }
  }));

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  if (!user.vipPage) {
    return NextResponse.json(
      { error: 'VIP page not found' },
      { status: 404 }
    );
  }

  const updatedVIPPage = await withRetry(() =>
    prisma.vIPPage.update({
      where: { id: user.vipPage?.id },
      data: {
        description: body.description || user.vipPage?.description,
        active: body.active !== undefined ? body.active : user.vipPage?.active,
      },
    })
  );

  return NextResponse.json({ page: updatedVIPPage }, { status: 200 });
}