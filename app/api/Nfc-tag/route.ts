import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db'; // 1. Import the database connection function

/**
 * @route   POST /api/tags
 * @desc    Create a new NFC Tag (handles both manual and mobile WebNFC registration)
 * @access  Private
 */
export async function POST(request: Request) {
  try {
    // 2. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 3. Get the initialized models FROM the sequelize instance
    const { NfcTag } = sequelize.models;

    const { tagUid, tagName } = await request.json();

    if (!tagUid) {
      return NextResponse.json({ message: 'tagUid is required.' }, { status: 400 });
    }

    const [tag, created] = await NfcTag.findOrCreate({
      where: { tagUid },
      defaults: {
        tagName: tagName || `Tag-${tagUid.substring(0, 8)}`,
      },
    });

    const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/t/${(tag as any).get('tagUid')}`;

    return NextResponse.json({
      message: `Tag ${created ? 'created' : 'found'} successfully.`,
      tag,
      publicUrl,
    }, { status: created ? 201 : 200 });

  } catch (error) {
    console.error('TAG_CREATE_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * @route   GET /api/tags
 * @desc    Get a list of all NFC Tags and their assigned pages
 * @access  Private
 */
export async function GET() {
  try {
    // 1. Connect to the DB and get the sequelize instance
    const sequelize = await connectAndSyncDb();
    // 2. Get the initialized models FROM the sequelize instance
    const { NfcTag, ContentPage } = sequelize.models;

    const tags = await NfcTag.findAll({
      include: [{
        model: ContentPage,
        as: 'pages',
        attributes: ['id', 'title'],
        through: { attributes: [] }
      }],
      order: [['createdAt', 'DESC']],
    });
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error('TAG_GET_ALL_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

