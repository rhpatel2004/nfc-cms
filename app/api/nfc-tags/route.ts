// app/api/nfc-tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NfcTag } from '@/lib/models/NfcTag'; // Ensure this import is correct
import db, { initializeDatabase } from '@/lib/db';

// POST: Create a new NFC Tag record (initial creation)
export async function POST(req: NextRequest) {
    await initializeDatabase();
    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Tag name is required.' }, { status: 400 });
        }

        // Create the record. tagId and pageId will be null initially, 
        // or you can set a default pageId if required.
        const newTag = await db.NfcTag.create({ name, tagId: null, pageId: null });

        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        console.error("Error creating tag:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

// GET: Fetch all NFC Tags, including the name of the assigned page
export async function GET() {
    await initializeDatabase();
    try {
        const tags = await db.NfcTag.findAll({
            // Include the assigned page name for the list view
            include: [{ 
                model: db.Page, 
                as: 'assignedPage',
                attributes: ['name', 'slug'], // Only need name and slug of the page
            }],
            order: [['createdAt', 'DESC']],
        });
        return NextResponse.json(tags, { status: 200 });
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}