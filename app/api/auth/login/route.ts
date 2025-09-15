// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db, { UserAttributes } from '@/lib/db'; // Correctly import UserAttributes
import { Model } from 'sequelize';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Find the user and tell TypeScript it's a Model with our attributes
    const user: Model<UserAttributes, any> | null = await db.User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    
    // Now you can safely access user.passwordHash as a string
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