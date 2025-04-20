import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { GET, PATCH } from '@/app/api/user/settings/route';
import { NextRequest, NextResponse } from 'next/server';
import { Session } from 'next-auth';
import { Weekday } from '@prisma/client';

// Mock authOptions module
vi.mock('@/lib/authOptions', () => {
  return {
    authOptions: {
      providers: [{ id: 'google', name: 'Google' }]
    }
  };
});

// Mock the modules
vi.mock('next-auth', () => {
  return {
    getServerSession: vi.fn()
  };
});

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      userHealthInfo: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
      }
    },
  };
});

// Import the mocked modules
const { getServerSession } = await import('next-auth');
const { prisma } = await import('@/lib/prisma');

// Type for our mock user
type MockUser = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  isAdmin: boolean;
  gender: string | null;
  firstDayOfWeek: Weekday;
  weekDays: Weekday[];
  birthDate: Date | null;
  healthInfo?: { weight: number } | null;
};

// Create mock data
const mockUser: MockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  picture: null,
  isAdmin: false,
  gender: null,
  firstDayOfWeek: 'MONDAY' as Weekday,
  weekDays: ['MONDAY', 'WEDNESDAY'] as Weekday[],
  birthDate: new Date('2000-01-01'),
  healthInfo: { weight: 70 }
};

const mockSession: Session = { 
  user: { email: mockUser.email, name: 'Test User' },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

// Helper to create mock NextRequest
function createMockNextRequest(body: any = null): NextRequest {
  return {
    json: async () => body,
    url: 'http://localhost:3000/api/user/settings',
    headers: new Headers({ 'content-type': 'application/json' }),
    cookies: new Map(),
    nextUrl: new URL('http://localhost:3000/api/user/settings'),
  } as unknown as NextRequest;
}

describe('/api/user/settings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns user settings for authenticated user', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.userHealthInfo.findUnique).mockResolvedValue({ 
      id: 'health-123',
      userId: mockUser.id,
      weight: 70,
      fat: null,
      muscle: null,
      height: null,
      basal: null
    });
    
    // Call the API
    const res = await GET();
    expect(res).toBeInstanceOf(NextResponse);
    
    // Check the response
    const json = await res.json();
    expect(json).toMatchObject({
      firstDayOfWeek: mockUser.firstDayOfWeek,
      weekDays: mockUser.weekDays,
      weight: 70
    });
  });

  it('GET returns 401 if not authenticated', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(null);
    
    // Call the API
    const res = await GET();
    expect(res.status).toBe(401);
    
    const json = await res.json();
    expect(json).toHaveProperty('error', 'Unauthorized');
  });

  it('PATCH updates user fields (happy path)', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUser,
      firstDayOfWeek: 'FRIDAY' as Weekday
    });
    
    // Call the API
    const req = createMockNextRequest({ firstDayOfWeek: 'FRIDAY' });
    const res = await PATCH(req);
    
    // Check the response
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: mockUser.email },
      data: expect.objectContaining({ firstDayOfWeek: 'FRIDAY' }),
    });
    
    const json = await res.json();
    expect(json.user).toHaveProperty('firstDayOfWeek', 'FRIDAY');
  });

  it('PATCH allows partial update (weekDays only)', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUser,
      weekDays: ['TUESDAY'] as Weekday[]
    });
    
    // Call the API
    const req = createMockNextRequest({ weekDays: ['TUESDAY'] });
    const res = await PATCH(req);
    
    // Check the response
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: mockUser.email },
      data: expect.objectContaining({ weekDays: ['TUESDAY'] }),
    });
    
    const json = await res.json();
    expect(json.user).toHaveProperty('weekDays');
    expect(json.user.weekDays).toEqual(['TUESDAY']);
  });

  it('PATCH returns 401 if not authenticated', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(null);
    
    // Call the API
    const req = createMockNextRequest({ firstDayOfWeek: 'FRIDAY' });
    const res = await PATCH(req);
    
    // Check the response
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toHaveProperty('error', 'Unauthorized');
  });
  
  it('PATCH returns 400 on invalid input', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    
    // Call the API
    const req = createMockNextRequest({ firstDayOfWeek: 'INVALID_DAY' });
    const res = await PATCH(req);
    
    // Check the response
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('GET returns 404 if user not found', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    // Call the API
    const res = await GET();
    
    // Check the response
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toHaveProperty('error', 'User not found');
  });

  it('PATCH with empty body returns 200 (no update)', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    vi.mocked(prisma.user.update).mockResolvedValue(mockUser);
    
    // Call the API
    const req = createMockNextRequest({});
    const res = await PATCH(req);
    
    // Check the response
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('user');
  });

  it('PATCH returns 400 if weekDays is not an array', async () => {
    // Setup mocks
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    
    // Call the API
    const req = createMockNextRequest({ weekDays: 'MONDAY' });
    const res = await PATCH(req);
    
    // Check the response
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });
});
