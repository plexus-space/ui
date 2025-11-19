import { NextRequest, NextResponse } from 'next/server';

// Store your OpenWeatherMap API key here (or in .env.local)
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

// Rate limiting: Simple in-memory store
// In production, use Redis or a proper rate limiting service
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_MINUTE = 50; // Leave buffer below 60/min limit
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - record.count };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // Validate input
  if (!city && (!lat || !lon)) {
    return NextResponse.json(
      { error: 'Either city or lat/lon coordinates required' },
      { status: 400 }
    );
  }

  // Check API key
  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error: API key not set' },
      { status: 500 }
    );
  }

  // Rate limiting (use IP or a combination of IP and user agent)
  const identifier = request.headers.get("x-forwarded-for") || 'unknown';
  const rateLimit = checkRateLimit(identifier);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again in a minute.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString(),
        },
      }
    );
  }

  // Build OpenWeatherMap API URL
  const params = new URLSearchParams({
    appid: OPENWEATHER_API_KEY,
    units: 'metric',
  });

  if (city) {
    params.append('q', city);
  } else if (lat && lon) {
    params.append('lat', lat);
    params.append('lon', lon);
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || `OpenWeatherMap API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return weather data with rate limit headers
    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300', // Cache for 10 min
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
