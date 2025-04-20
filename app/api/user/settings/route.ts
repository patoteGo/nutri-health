import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Enum must match your Prisma Weekday enum
const WeekdayEnum = z.enum([
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
]);

const SettingsSchema = z.object({
  firstDayOfWeek: WeekdayEnum.optional(),
  weekDays: z.array(WeekdayEnum).optional(),
  birthDate: z.string().datetime({ offset: true }).optional(),
  weight: z.number().optional(), // Added weight
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        firstDayOfWeek: true,
        weekDays: true,
        birthDate: true,
        healthInfo: {
          select: {
            weight: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Flatten weight for client convenience
    const userWithWeight = {
      ...user,
      weight: user?.healthInfo?.weight ?? null,
    };
    delete userWithWeight.healthInfo;
    return NextResponse.json(userWithWeight);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch user settings', details: e }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let data;
  try {
    data = SettingsSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'Invalid input', details: e }, { status: 400 });
  }

  try {
    // Update user basic fields
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(data.firstDayOfWeek && { firstDayOfWeek: data.firstDayOfWeek }),
        ...(data.weekDays && { weekDays: data.weekDays }),
        ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
      },
    });

    // Upsert weight in UserHealthInfo
    if (typeof data.weight === 'number') {
      await prisma.userHealthInfo.upsert({
        where: { userId: updatedUser.id },
        update: { weight: data.weight },
        create: { userId: updatedUser.id, weight: data.weight },
      });
    }

    // Refetch updated weight
    const updatedHealthInfo = await prisma.userHealthInfo.findUnique({
      where: { userId: updatedUser.id },
      select: { weight: true },
    });

    return NextResponse.json({ user: { ...updatedUser, weight: updatedHealthInfo?.weight ?? null } });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update user', details: e }, { status: 500 });
  }
}
