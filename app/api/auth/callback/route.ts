import { NextResponse } from 'next/server';
import { withRetry, prisma } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/en/';

  if (!code) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = await serverSupabase();

  // Exchange the code for a session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  const supabase_user = (await supabase.auth.getUser()).data.user;

  const zesty_user = await withRetry(() => prisma.user.findUnique({
    where: {
      supabaseId: supabase_user?.id
    }
  }));

  if (!zesty_user) {
    withRetry(() => prisma.user.create({
      data: {
        supabaseId: supabase_user?.id!,
      }
    })).catch((error) => {
      console.error('Error creating Zesty user:', error);
    });
  }

  // Redirect to the intended destination
  return NextResponse.redirect(new URL(next, request.url));
}