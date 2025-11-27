import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { Op } from 'sequelize';

// GET: Aggregate statistics for the dashboard
export async function GET() {
  try {
    await db.sequelize.authenticate(); // Ensure DB is ready

    // 1. Total Counts
    const totalUsers = await db.User.count();
    const totalPages = await db.Page.count();
    const totalTags = await db.NfcTag.count();
    
    // 2. Tag Statuses
    const registeredTags = await db.NfcTag.count({
      where: { tagId: { [Op.ne]: null } }, // tagId is NOT null
    });

    const unregisteredTags = totalTags - registeredTags;
    
    const assignedTags = await db.NfcTag.count({
      where: { pageId: { [Op.ne]: null } }, // pageId is NOT null
    });

    const unassignedTags = registeredTags - assignedTags;

    // 3. Page Statuses (Live vs. Draft - using assignment status as a proxy for "live")
    const livePages = assignedTags; // Pages linked to a tag are considered "live"
    const draftPages = totalPages - assignedTags; // Pages not linked are potential drafts

    const stats = {
      user: {
        total: totalUsers,
      },
      page: {
        total: totalPages,
        live: livePages,
        draft: draftPages,
      },
      tag: {
        total: totalTags,
        registered: registeredTags,
        unregistered: unregisteredTags,
        assigned: assignedTags,
        unassigned: unassignedTags,
      },
      // You could add analytics data here later (e.g., total taps/clicks)
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ message: 'Failed to load dashboard statistics.' }, { status: 500 });
  }
}