import { NextResponse } from 'next/server';
import connectAndSyncDb from '@/lib/db';

/**
 * @route   GET /api/dashboard
 * @desc    Get a summary of key information for the admin dashboard.
 * @access  Private (Requires authentication)
 */
export async function GET() {
  try {
    const sequelize = await connectAndSyncDb();
    const { NfcTag, ContentPage, Analytics, User } = sequelize.models;

    // --- 1. GATHER KEY METRICS ---
    // Perform several quick count operations in parallel for speed.
    const [tagCount, pageCount, tapCount] = await Promise.all([
      NfcTag.count(),
      ContentPage.count(),
      Analytics.count(),
    ]);

    // --- 2. GET RECENT ACTIVITY ---
    // Fetch the 5 most recently updated content pages.
    const recentPages = await ContentPage.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'title', 'updatedAt'], // Only get the data we need
      include: [{
        model: User,
        as: 'author',
        attributes: ['username'] // Include the author's name
      }]
    });

    // --- 3. COMBINE AND RETURN THE DATA ---
    // Send all the gathered information in a single, clean JSON object.
    return NextResponse.json({
      summary: {
        totalTags: tagCount,
        totalPages: pageCount,
        totalTaps: tapCount,
      },
      recentActivity: recentPages,
    }, { status: 200 });

  } catch (error) {
    console.error('DASHBOARD_GET_ERROR:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
