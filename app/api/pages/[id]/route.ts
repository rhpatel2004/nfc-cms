import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db'; // 1. Import the database connection function

/**
 * @route   GET /api/pages/[pageId]
 * @desc    Get a single content page by its ID
 * @access  Private
 */
export async function GET(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 3. Get the initialized model FROM the sequelize instance
    const { ContentPage } = sequelize.models;

    const { pageId } = params;
    const page = await ContentPage.findByPk(pageId);

    if (!page) {
      return NextResponse.json({ message: 'Page not found.' }, { status: 404 });
    }

    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error(`PAGE_GET_ONE_ERROR for page ${params.pageId}:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * @route   PUT /api/pages/[pageId]
 * @desc    Update an existing content page
 * @access  Private
 */
export async function PUT(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const sequelize = await connectAndSyncDb();
    const { ContentPage } = sequelize.models;

    const { pageId } = params;
    const page = await ContentPage.findByPk(pageId);

    if (!page) {
      return NextResponse.json({ message: 'Page not found.' }, { status: 404 });
    }

    const { title, contentJson, imageUrl, isPublished } = await request.json();

    const updatedPage = await (page as any).update({
      title,
      contentJson,
      imageUrl,
      isPublished,
    });

    return NextResponse.json(updatedPage, { status: 200 });
  } catch (error) {
    console.error(`PAGE_UPDATE_ERROR for page ${params.pageId}:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * @route   DELETE /api/pages/[pageId]
 * @desc    Delete a content page
 * @access  Private
 */
export async function DELETE(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const sequelize = await connectAndSyncDb();
    const { ContentPage } = sequelize.models;

    const { pageId } = params;
    const page = await ContentPage.findByPk(pageId);

    if (!page) {
      return NextResponse.json({ message: 'Page not found.' }, { status: 404 });
    }

    await (page as any).destroy();

    return NextResponse.json({ message: 'Page deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`PAGE_DELETE_ERROR for page ${params.pageId}:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

