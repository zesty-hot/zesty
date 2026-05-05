import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supaBase = await serverSupabase();
  const { data: session } = await supaBase.auth.getUser();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let user = await withRetry(() =>
    prisma.user.findFirst({
      where: {
        supabaseId: session.user.id,
      },
      include: {
        vipPage: true,
      }
    })
  );

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  if (user.vipPage) {
    return NextResponse.json(
      { error: 'VIP page already exists' },
      { status: 400 }
    );
  }

  const newVIPPage = await withRetry(() =>
    prisma.vIPPage.create({
      data: {
        zesty_id: user.zesty_id,
        description: 'My VIP Page',
        active: false,
      },
    })
  );

  if (!newVIPPage) {
    return NextResponse.json(
      { error: 'Failed to create VIP page' },
      { status: 500 }
    );
  }

  return NextResponse.json({ page: newVIPPage }, { status: 200 });
}