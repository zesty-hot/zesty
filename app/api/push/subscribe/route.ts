import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';
import { serverSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user.id },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys) {
      return NextResponse.json(
        { error: 'Missing subscription data' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await withRetry(() => prisma.pushSubscription.findUnique({
      where: { endpoint },
    }));

    if (existingSubscription) {
      // Update existing subscription
      const subscription = await withRetry(() => prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          keys: JSON.stringify(keys),
          zesty_id: user.zesty_id,
          active: true,
          userAgent: req.headers.get('user-agent') || undefined,
        },
      }));

      return NextResponse.json({ success: true, subscription });
    }

    // Create new subscription
    const subscription = await withRetry(() => prisma.pushSubscription.create({
      data: {
        endpoint,
        keys: JSON.stringify(keys),
        zesty_id: user.zesty_id,
        userAgent: req.headers.get('user-agent') || undefined,
      },
    }));

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user.id },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive
    await withRetry(() => prisma.pushSubscription.updateMany({
      where: {
        endpoint,
        zesty_id: user.zesty_id,
      },
      data: {
        active: false,
      },
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supaBase = await serverSupabase();
    const { data: session } = await supaBase.auth.getUser();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await withRetry(() => prisma.user.findUnique({
      where: { supabaseId: session.user.id },
      include: {
        pushSubscriptions: {
          where: { active: true },
        },
      },
    }));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      subscriptions: user.pushSubscriptions 
    });
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
