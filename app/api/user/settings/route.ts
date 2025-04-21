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
  birthDate: z.string().optional(), // Accept simple date string format (YYYY-MM-DD)
  weight: z.number().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
});

export async function GET() {
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
        gender: true,
        healthInfo: {
          select: {
            weight: true,
            height: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    // Flatten weight for client convenience
    // Define the expected structure of the user from Prisma
    interface UserWithHealthInfo {
      firstDayOfWeek?: string;
      weekDays?: string[];
      birthDate?: Date | null;
      gender?: string | null;
      healthInfo?: {
        weight?: number | null;
        height?: number | null;
      } | null;
    }
    
    // Use type assertion to help TypeScript understand the structure
    const typedUser = user as UserWithHealthInfo;
    
    // Create the flattened user object
    const userWithHealth = {
      firstDayOfWeek: typedUser.firstDayOfWeek,
      weekDays: typedUser.weekDays,
      birthDate: typedUser.birthDate,
      gender: typedUser.gender,
      weight: typedUser.healthInfo?.weight ?? null,
      height: typedUser.healthInfo?.height ?? null,
    };
    return NextResponse.json(userWithHealth);
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
    // Prepare update data
    const updateData: any = {};
    
    // Handle firstDayOfWeek if provided
    if (data.firstDayOfWeek) {
      updateData.firstDayOfWeek = data.firstDayOfWeek;
    }
    
    // Handle weekDays if provided
    if (data.weekDays) {
      updateData.weekDays = data.weekDays;
    }
    
    // Handle birthDate if provided
    if (data.birthDate) {
      try {
        // Validate the date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)) {
          return NextResponse.json({ 
            error: 'Invalid date format', 
            details: 'Birth date must be in YYYY-MM-DD format' 
          }, { status: 400 });
        }
        updateData.birthDate = new Date(data.birthDate);
      } catch (e) {
        return NextResponse.json({ 
          error: 'Invalid date', 
          details: 'Could not parse the provided birth date' 
        }, { status: 400 });
      }
    }
    
    // Handle gender if provided
    if (data.gender) {
      updateData.gender = data.gender;
    }
    
    // Update user basic fields
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    // Upsert weight and height in UserHealthInfo
    // Always attempt to update health info if the request contains weight or height data
    // even if they're null (to allow clearing values)
    const updateFields: { weight?: number | null; height?: number | null } = {};
    
    // Check if weight is provided in the request (could be a number or null)
    if ('weight' in data) {
      updateFields.weight = data.weight;
    }
    
    // Check if height is provided in the request (could be a number or null)
    if ('height' in data) {
      updateFields.height = data.height;
    }
    
    // Only proceed with the upsert if we have fields to update
    if (Object.keys(updateFields).length > 0) {
      await prisma.userHealthInfo.upsert({
        where: { userId: updatedUser.id },
        update: updateFields,
        create: { userId: updatedUser.id, ...updateFields },
      });
    }

    // Refetch updated health info
    const updatedHealthInfo = await prisma.userHealthInfo.findUnique({
      where: { userId: updatedUser.id },
      select: { weight: true, height: true },
    });

    // Return a flattened response with all user data including health info
    return NextResponse.json({
      firstDayOfWeek: updatedUser.firstDayOfWeek,
      weekDays: updatedUser.weekDays,
      birthDate: updatedUser.birthDate,
      gender: updatedUser.gender,
      weight: updatedHealthInfo?.weight ?? null,
      height: updatedHealthInfo?.height ?? null,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update user', details: e }, { status: 500 });
  }
}
