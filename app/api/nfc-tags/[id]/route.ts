// app/api/nfc-tags/[id]/route.ts (FINAL, RELIABLE VERSION)

import { NextRequest, NextResponse } from 'next/server';
import { NfcTag } from '@/lib/models/NfcTag'; // Ensure this import is correct for casting
import db, { initializeDatabase } from '@/lib/db';

// Define a common type for the context object
type RouteContext = { params: { id: string } };

export async function GET(
    request: Request,
 { params }: { params: { id: string } }   // 💡 FIX: Use the robust context signature
) {
    await initializeDatabase();
    
    // Access parameter via context
    const tagId = params.id;  

    if (!tagId || tagId === 'undefined') {
        // This prevents the crash by correctly returning 404 for unresolved paths
        return NextResponse.json({ message: 'Tag ID is missing or invalid.' }, { status: 404 }); 
    }


    try {
        const tag = await db.NfcTag.findOne({
            where: { id: tagId },
            include: [{
                model: db.Page,
                as: 'assignedPage',
                attributes: ['id', 'name', 'slug', 'content'], 
            }],
        });

        if (!tag) {
            return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
        }

        return NextResponse.json(tag, { status: 200 });
    } catch (error) {
        console.error("Error fetching single tag:", error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// =================================================================
// PUT Handler (Update Tag)
// =================================================================

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    await initializeDatabase();
    
    // Access parameter via context
    const tagId = params.id;

    if (!tagId || tagId === 'undefined') {
        // This handles the spurious 'undefined' requests from the Next.js runtime
        return NextResponse.json({ message: 'Tag ID is missing.' }, { status: 404 }); 
    }

    try {
        const { name, pageId, tagId: newTagId } = await req.json();

        // Find by the ID from the URL (tagId)
        const tag = (await db.NfcTag.findByPk(tagId)) as NfcTag | null; 

        if (!tag) {
            return NextResponse.json({ message: 'NFC Tag not found.' }, { status: 404 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (newTagId !== undefined) updateData.tagId = newTagId; // Use newTagId from body
        if (pageId !== undefined) updateData.pageId = pageId;

        // Check for unique tagId before updating
        if (newTagId && newTagId !== tag.tagId) { 
            const existingTag = await db.NfcTag.findOne({ where: { tagId: newTagId } });
            if (existingTag && existingTag.id !== tag.id) {
                return NextResponse.json({ message: 'This physical card is already registered to another tag record.' }, { status: 409 });
            }
        }
        
        await tag.update(updateData);
        
        return NextResponse.json({ message: 'NFC Tag updated successfully.' }, { status: 200 });
    } catch (error) {
        console.error("Error updating tag:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: { id: string } }
) {
    await initializeDatabase();
    const tagId = params.id;

    if (!tagId || tagId === 'undefined') {
        return NextResponse.json({ message: 'Tag ID is missing.' }, { status: 400 });
    }

    try {
        const tag = await db.NfcTag.findByPk(tagId);

        if (!tag) {
            return NextResponse.json({ message: 'NFC Tag not found.' }, { status: 404 });
        }

        await tag.destroy();
        
        return NextResponse.json({ message: 'NFC Tag deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error("Error deleting tag:", error);
        return NextResponse.json(
            { message: 'An internal server error occurred during deletion.' },
            { status: 500 }
        );
    }
}
