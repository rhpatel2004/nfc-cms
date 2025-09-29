import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db';
import { Sequelize } from 'sequelize'; // Import Sequelize for its functions

/**
 * @route   GET /api/analytics/tags
 * @desc    Get a list of all NFC tags with their total tap count.
 * @access  Private (Requires authentication)
 */
export async function GET() {
  try {
    const sequelize = await connectAndSyncDb();
    const { NfcTag, Analytics, ContentPage } = sequelize.models;

    // This is a powerful query that joins the tables and calculates the count.
    const tagsWithTapCounts = await NfcTag.findAll({
      // 1. Specify which columns we want from the NfcTag table
      attributes: [
        'id',
        'tagUid',
        'tagName',
        'status',
        // 2. Create a new, calculated column called 'tapCount'
        // This counts the number of associated rows in the Analytics table.
        [Sequelize.fn('COUNT', Sequelize.col('taps.id')), 'tapCount'],
      ],
      // 3. Include the Analytics model so we can count its rows
      include: [
        {
          model: Analytics,
          as: 'taps', // This alias must match your association in db.ts
          attributes: [], // We don't need any actual columns from Analytics, just the count
        },
        {
          model: ContentPage,
          as: 'pages', // Also include assigned pages for context
          attributes: ['id', 'title'],
          through: { attributes: [] }
        }
      ],
      // 4. Group the results by tag to ensure the count is correct for each tag
      group: ['NfcTag.id', 'pages.id'],
      // 5. Order the results to show the most tapped tags first
      order: [[Sequelize.literal('tapCount'), 'DESC']],
    });

    return NextResponse.json(tagsWithTapCounts, { status: 200 });

  } catch (error) {
    console.error('ANALYTICS_TAGS_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
