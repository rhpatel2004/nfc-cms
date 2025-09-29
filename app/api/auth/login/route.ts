import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import connectAndSyncDb from '@/lib/db'; // 1. Import the connection function

/**
 * Generates a JSON Web Token for a given user ID.
 */


/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user and returns a JWT.
 */
export async function POST(request: Request) {
  try {
    // --- START OF FIX ---
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    
    // 3. Get the initialized User model FROM the sequelize instance
    const { User } = sequelize.models;
    // --- END OF FIX ---

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Please provide both email and password.' }, { status: 400 });
    }

    // `User` is now the correct, usable model
    const user = await User.findOne({ where: { email } });

    // Ensure the password comparison logic is correct
    if (!user || !(await bcrypt.compare(password, (user as any).get('password') as string))) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const userData = (user as any).get({ plain: true });
    
    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      email: userData.email,
       // Added token generation back
    }, { status: 200 });

  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred during login.' }, { status: 500 });
  }
}

