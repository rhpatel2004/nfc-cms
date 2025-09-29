import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db'; // 1. Import the database connection function

/**
 * @route   GET /api/tags/[tagUid]
 * @desc    Find a single NFC Tag by its unique ID (tagUid) and its content.
 * @access  Public
 */
export async function GET(
  request: Request,
  { params }: { params: { tagUid: string } }
) {
  try {
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 3. Get the initialized models FROM the sequelize instance
    const { NfcTag, ContentPage } = sequelize.models;

    const { tagUid } = params;

    const tag = await NfcTag.findOne({
      where: { tagUid },
      include: [{
        model: ContentPage,
        as: 'pages',
        attributes: ['id', 'title', 'contentJson', 'imageUrl'],
        through: { attributes: [] }
      }],
    });

    if (!tag) {
      return NextResponse.json({ message: 'NFC Tag not found.' }, { status: 404 });
    }

    return NextResponse.json(tag, { status: 200 });

  } catch (error) {
    console.error(`TAG_GET_BY_UID_ERROR for ${params.tagUid}:`, error);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}


/**
 * @route   DELETE /api/nfc-tags/[tagUid]
 * @desc    Delete a single NFC Tag by its unique ID (tagUid)
 * @access  Private (Requires authentication)
 */

export async function DELETE(
  request: Request,
  { params }: { params: { tagUid: string } }
) {
  try {
    const sequelize = await connectAndSyncDb();
    const { NfcTag, Analytics } = sequelize.models;
    const { tagUid } = params;

    // 1. Find the tag to ensure it exists before trying to delete it
    const tag = await NfcTag.findOne({ where: { tagUid } });

    if (!tag) {
      return NextResponse.json({ message: 'NFC Tag not found.' }, { status: 404 });
    }

    // 2. IMPORTANT: Handle dependencies before deleting the tag itself.
    // To maintain data integrity, we should first remove any links to this tag.
    // This removes all entries from the 'TagAssignment' join table for this tag.
    await (tag as any).setPages([]); 

    // Optional: You could also delete all associated analytics logs.
    // await Analytics.destroy({ where: { tagId: (tag as any).id } });

    // 3. Now that dependencies are handled, delete the tag itself.
    await (tag as any).destroy();
    
    // 4. Return a success message.
    return NextResponse.json({ message: `Tag with UID '${tagUid}' deleted successfully.` }, { status: 200 });

  } catch (error) {
    console.error(`TAG_DELETE_ERROR for ${params.tagUid}:`, error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
