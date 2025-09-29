import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db'; // 1. Import the database connection function

/**
 * @route   POST /api/pages
 * @desc    Create a new content page
 * @access  Private
 */
export async function POST(request: Request) {
  try {
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 3. Get the initialized models FROM the sequelize instance
    const { ContentPage, User } = sequelize.models;

    const { title, contentJson, imageUrl, authorId } = await request.json();

    if (!title || !contentJson || !authorId) {
      return NextResponse.json({ message: 'Title, contentJson, and authorId are required.' }, { status: 400 });
    }

    const author = await User.findByPk(authorId);
    if (!author) {
        return NextResponse.json({ message: 'Author not found.' }, { status: 404 });
    }

    const newPage = await ContentPage.create({
      title,
      contentJson,
      imageUrl,
      authorId,
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('PAGE_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * @route   GET /api/pages
 * @desc    Get a list of all content pages
 * @access  Private
 */
export async function GET() {
  try {
    // 1. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 2. Get the initialized models FROM the sequelize instance
    const { ContentPage, User } = sequelize.models;

    const pages = await ContentPage.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username'],
      }],
      order: [['createdAt', 'DESC']],
    });
    return NextResponse.json(pages, { status: 200 });
  } catch (error) {
    console.error('PAGE_GET_ALL_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

