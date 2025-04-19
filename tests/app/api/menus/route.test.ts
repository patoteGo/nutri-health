import { POST, DELETE } from '../../../../app/api/menus/route';
import { NextRequest } from 'next/server';

// Mock prisma
import { vi, describe, it, expect, afterEach } from 'vitest';
vi.mock('../../../../lib/prisma', () => ({
  prisma: {
    meal: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
import { prisma } from '../../../../lib/prisma';

describe('/api/menus route handlers', () => {
  afterEach(() => vi.clearAllMocks());

  describe('POST', () => {
    it('creates a menu (happy path)', async () => {
      prisma.meal.create.mockResolvedValue({ id: 'menu1', parts: [{ id: 'ing1', name: 'Egg', weight: 50 }] });
      const req = { json: async () => ({
        name: 'Menu1', category: 'Breakfast', personId: 'user1', ingredients: [{ id: 'ing1', name: 'Egg', weight: 50, carbs: 1, protein: 2, fat: 3 }]
      }) } as unknown as NextRequest;
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toMatchObject({
        id: 'menu1',
        name: 'Menu1',
        category: 'Breakfast',
        personId: 'user1',
        ingredients: [{ id: 'ing1', name: 'Egg', weight: 50 }],
      });
    });

    it('returns 400 for invalid menu data', async () => {
      const req = { json: async () => ({}) } as unknown as NextRequest;
      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/Invalid menu data/);
    });
  });

  describe('DELETE', () => {
    it('deletes a menu (happy path)', async () => {
      prisma.meal.delete.mockResolvedValue({ id: 'menu1' });
      const req = { url: 'http://localhost/api/menus?id=menu1' } as NextRequest;
      const res = await DELETE(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('returns 400 if id is missing', async () => {
      const req = { url: 'http://localhost/api/menus' } as NextRequest;
      const res = await DELETE(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/Missing menu id/);
    });

    it('returns 404 if menu not found', async () => {
      const err = new Error('Not found');
      err.code = 'P2025';
      prisma.meal.delete.mockRejectedValue(err);
      const req = { url: 'http://localhost/api/menus?id=doesnotexist' } as NextRequest;
      const res = await DELETE(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toMatch(/not found/);
    });
  });
});
