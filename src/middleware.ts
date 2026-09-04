import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { globalApiRateLimiter } from '@/lib/security/rate-limiter';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. API 요청에 대한 Rate Limiting 검사
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/health')) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = globalApiRateLimiter.check(ip);

    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: '요청 한도를 초과했습니다 (Too Many Requests). 잠시 후 다시 시도해주세요.',
          resetTimeMs: rateLimit.resetTimeMs,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
  }

  // 2. 보안 응답 헤더 추가
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons)
     * - manifest.json
     * - sw.js
     * - offline.html
     */
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)',
  ],
};
