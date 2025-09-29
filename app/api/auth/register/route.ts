import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectAndSyncDb from '@/lib/db'; // 1. Import the connection function

/**
 * @route   POST /api/auth/register
 * @desc    Handles the creation of a new user.
 * @access  Public
 */
export async function POST(request: Request) {
  try {
    // --- START OF FIX ---
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    
    // 3. Get the initialized User model FROM the sequelize instance
    const { User } = sequelize.models;
    // --- END OF FIX ---

    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Please provide all required fields.' }, { status: 400 });
    }

    // Now, this `User` is the actual, usable model, so .findOne() will work
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // .create() will also work correctly now
    const newUser = await User.create({
      username,
      email,
      password: passwordHash,
    });

    // We must cast here because the base Model type doesn't know about 'get'
    const userData = (newUser as any).get({ plain: true });
    
    return NextResponse.json({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      message: 'User registered successfully. You may now log in.',
    }, { status: 201 });

  } catch (error) {
    console.error('REGISTRATION_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

