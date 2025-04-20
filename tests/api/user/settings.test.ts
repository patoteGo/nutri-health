import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PATCH } from '@/app/api/user/settings/route';
import { createMocks } from 'node-mocks-http';
import { getServerSession } from 'next-auth';

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockUser = {
  email: 'test@example.com',
  firstDayOfWeek: 'MONDAY',
  weekDays: ['MONDAY', 'WEDNESDAY'],
  birthDate: '2000-01-01T00:00:00.000Z',
};

const session = { user: { email: mockUser.email } };

const { prisma } = require('@/lib/prisma');

// Helper to mock req/res
function mockReqRes(method = 'GET', body = null) {
  const { req, res } = createMocks({
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  req.headers = { 'content-type': 'application/json' };
  return { req, res };
}

describe('/api/user/settings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns user settings for authenticated user', async () => {
    getServerSession.mockResolvedValue(session);
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const req = { headers: {} };
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      firstDayOfWeek: mockUser.firstDayOfWeek,
      weekDays: mockUser.weekDays,
      birthDate: mockUser.birthDate,
    });
  });

  it('GET returns 401 if not authenticated', async () => {
    getServerSession.mockResolvedValue(null);
    const req = { headers: {} };
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('PATCH updates user fields (happy path)', async () => {
    getServerSession.mockResolvedValue(session);
    prisma.user.update.mockResolvedValue({ ...mockUser, firstDayOfWeek: 'FRIDAY' });
    const req = { json: async () => ({ firstDayOfWeek: 'FRIDAY' }) };
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: mockUser.email },
      data: { firstDayOfWeek: 'FRIDAY' },
    });
    expect(json.user.firstDayOfWeek).toBe('FRIDAY');
  });

  it('PATCH allows partial update (weekDays only)', async () => {
    getServerSession.mockResolvedValue(session);
    prisma.user.update.mockResolvedValue({ ...mockUser, weekDays: ['TUESDAY'] });
    const req = { json: async () => ({ weekDays: ['TUESDAY'] }) };
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: mockUser.email },
      data: { weekDays: ['TUESDAY'] },
    });
    expect(json.user.weekDays).toEqual(['TUESDAY']);
  });

  it('PATCH returns 401 if not authenticated', async () => {
    getServerSession.mockResolvedValue(null);
    const req = { json: async () => ({ firstDayOfWeek: 'FRIDAY' }) };
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('PATCH returns 400 on invalid input', async () => {
    getServerSession.mockResolvedValue(session);
    const req = { json: async () => ({ firstDayOfWeek: 'INVALID_DAY' }) };
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('GET returns 404 if user not found', async () => {
    getServerSession.mockResolvedValue(session);
    prisma.user.findUnique.mockResolvedValue(null);
    const req = { headers: {} };
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('PATCH with empty body returns 200 (no update)', async () => {
    getServerSession.mockResolvedValue(session);
    prisma.user.update.mockResolvedValue({ ...mockUser });
    const req = { json: async () => ({}) };
    const res = await PATCH(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: mockUser.email },
      data: {},
    });
    expect(json.user).toBeDefined();
  });

  it('PATCH returns 400 if weekDays is not an array', async () => {
    getServerSession.mockResolvedValue(session);
    const req = { json: async () => ({ weekDays: 'MONDAY' }) };
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });
});
