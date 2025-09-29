import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db'; // 1. Import the database connection function

/**
 * @route   POST /api/tags/assign
 * @desc    Assign a Content Page to an NFC Tag by creating a link in the join table.
 * @access  Private
 */
export async function POST(request: Request) {
  try {
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 3. Get the initialized models FROM the sequelize instance
    const { NfcTag, ContentPage } = sequelize.models;

    const { tagId, pageId } = await request.json();

    if (!tagId || !pageId) {
      return NextResponse.json({ message: 'Both tagId and pageId are required.' }, { status: 400 });
    }

    const tag = await NfcTag.findByPk(tagId);
    const page = await ContentPage.findByPk(pageId);

    if (!tag || !page) {
      return NextResponse.json({ message: 'The specified Tag or Page could not be found.' }, { status: 404 });
    }

    // Use Sequelize's special 'add' method to create the link
    await (tag as any).addPage(page);

    // Update the tag's status to 'active'
    await (tag as any).update({ status: 'active' });

    return NextResponse.json({ message: 'Page assigned successfully.' }, { status: 200 });

  } catch (error) {
    console.error('TAG_ASSIGN_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * @route   DELETE /api/tags/assign
 * @desc    Unassign a Content Page from an NFC Tag by removing the link.
 * @access  Private
 */
export async function DELETE(request: Request) {
  try {
    // 1. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 2. Get the initialized models FROM the sequelize instance
    const { NfcTag, ContentPage } = sequelize.models;

    const { tagId, pageId } = await request.json();

    if (!tagId || !pageId) {
      return NextResponse.json({ message: 'Both tagId and pageId are required.' }, { status: 400 });
    }

    const tag = await NfcTag.findByPk(tagId);
    const page = await ContentPage.findByPk(pageId);

    if (!tag || !page) {
      return NextResponse.json({ message: 'The specified Tag or Page could not be found.' }, { status: 404 });
    }

    // Use Sequelize's special 'remove' method to delete the link
    await (tag as any).removePage(page);

    // Check if the tag has any other pages left
    const remainingPages = await (tag as any).getPages();
    if (remainingPages.length === 0) {
      // If no pages are left, set the tag's status back to 'unassigned'
      await (tag as any).update({ status: 'unassigned' });
    }

    return NextResponse.json({ message: 'Page unassigned successfully.' }, { status: 200 });

  } catch (error) {
    console.error('TAG_UNASSIGN_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

