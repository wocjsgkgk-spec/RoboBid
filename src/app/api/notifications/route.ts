import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notification-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('organizationId') || 'org-robobid-default';
  const recipientId = searchParams.get('recipientId') || undefined;
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  try {
    const notifications = notificationService.getNotifications(orgId, {
      recipientId,
      unreadOnly,
    });
    const settings = notificationService.getSettings(orgId);

    return NextResponse.json({
      notifications,
      settings,
      unreadCount: notifications.filter((n) => !n.readAt).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAll, organizationId, recipientId } = body;

    if (markAll && organizationId) {
      const count = notificationService.markAllAsRead(organizationId, recipientId);
      return NextResponse.json({ success: true, count });
    }

    if (notificationId) {
      const success = notificationService.markAsRead(notificationId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
