import { NextRequest, NextResponse } from 'next/server';

// 메모리 구독 캐시 (테스트 및 런타임)
const memoryPushSubscriptions: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, userId = 'user-current', organizationId = 'org-default' } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Valid PushSubscription with endpoint is required' },
        { status: 400 }
      );
    }

    const subId = crypto.randomUUID();
    const record = {
      id: subId,
      userId,
      organizationId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      createdAt: new Date().toISOString(),
    };

    memoryPushSubscriptions.set(subscription.endpoint, record);

    return NextResponse.json(
      {
        success: true,
        message: 'Web Push subscription registered successfully',
        subscriptionId: subId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') || 'org-default';

  const list = Array.from(memoryPushSubscriptions.values()).filter(
    (s) => s.organizationId === orgId
  );

  return NextResponse.json({ subscriptions: list });
}
