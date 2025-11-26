import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const content = await withRetry(() => prisma.vIPContent.findUnique({
    where: { id }
  }));

  if (!content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  if (content.vipPageId !== user.vipPage.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await withRetry(() => prisma.vIPContent.delete({
    where: { id }
  }));

  return NextResponse.json({ success: true });
}
