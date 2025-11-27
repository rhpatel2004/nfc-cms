// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db, { initializeDatabase } from '@/lib/db';
import { Model } from 'sequelize';
// 💡 FIX 1: Import the UserAttributes interface
import { UserAttributes ,UserCreationAttributes } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  await initializeDatabase();
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // 💡 FIX 2: Replace 'any' with the specific UserAttributes interface
    const user: Model<UserAttributes, UserCreationAttributes> | null = await db.User.findOne({ where: { email } }); 
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    
    // Now you can safely access user.passwordHash as a string
    // We use user.get('passwordHash') to safely extract the string property from the Model instance
    const passwordMatch = await bcrypt.compare(password, user.get('passwordHash') as string);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Logged in successfully.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}