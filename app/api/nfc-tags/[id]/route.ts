// app/api/nfc-tags/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { initializeDatabase } from '@/lib/db';
import { Model, ModelStatic } from 'sequelize';
import { NfcTagAttributes, NfcTagCreationAttributes } from '@/lib/models/NfcTag'; 
import { PageAttributes } from '@/lib/models/Page';
import { headers } from 'next/headers'; 

// --- TYPE DEFINITIONS ---

interface ResolvedParams {
  id: string; 
}
type RouteContext = {
  params: Promise<ResolvedParams>;
};

// 💡 FIX 1: Define the PageModelStatic using the correct creation type (NOT 'any')
type PageModelStatic = ModelStatic<Model<PageAttributes, PageAttributes>>; 
// Note: We use PageAttributes for both generic slots for simplicity and strict typing.

type NfcTagModel = Model<NfcTagAttributes, NfcTagCreationAttributes>; 

// 💡 FIX 2: Define a union type for all successful API responses (eliminates any)
type NfcTagResponse = 
    NextResponse<NfcTagAttributes> | // For successful GET request
    NextResponse<{ message: string }>; // For successful PUT/DELETE request


// =================================================================
// GET Handler
// =================================================================
// 💡 FIX 3: Use the fully strict return type (Union of expected successes/failures)
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NfcTagResponse> { 
  headers(); 
  await initializeDatabase();
  
  const { id } = await context.params; 

  if (!id || id === 'undefined') {
    return NextResponse.json({ message: 'Tag ID is missing or invalid.' }, { status: 404 }); 
  }

  try {
    const tag: NfcTagModel | null = await db.NfcTag.findOne({
      where: { id },
      include: [{
        // 💡 FIX 4: Apply the strictly typed static model
        model: db.Page as PageModelStatic,
        as: 'assignedPage',
        attributes: ['id', 'name', 'slug', 'content'],
      }],
    }); 
    
    if (!tag) {
      return NextResponse.json({ message: 'Tag not found' }, { status: 404 });
    }
    
    const tagJson: NfcTagAttributes = tag.toJSON() as NfcTagAttributes;

    return NextResponse.json(tagJson, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching single tag:", error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// =================================================================
// PUT Handler
// =================================================================
// 💡 FIX 5: Use the fully strict return type (Union of expected successes/failures)
export async function PUT(
  req: NextRequest, 
  context: RouteContext
): Promise<NfcTagResponse> {
  await initializeDatabase();
  
  const { id: urlId } = await context.params; 
  
  if (!urlId || urlId === 'undefined') {
    return NextResponse.json({ message: 'Tag ID is missing.' }, { status: 404 }); 
  }

  try {
    const body: Record<string, string | number | undefined> = await req.json();
    const { name, pageId, tagId: newTagId } = body;


    const tag: NfcTagModel | null = await db.NfcTag.findByPk(urlId); 
    if (!tag) {
      return NextResponse.json({ message: 'NFC Tag not found.' }, { status: 404 });
    }

    const updateData: Record<string, string | number | null | undefined> = {}; 
    if (name !== undefined) updateData.name = name;
    if (newTagId !== undefined) updateData.tagId = newTagId;
    if (pageId !== undefined) updateData.pageId = pageId; 

    if (newTagId && newTagId !== tag.get('tagId')) {
      const existingTag: NfcTagModel | null = await db.NfcTag.findOne({ where: { tagId: newTagId } });
      if (existingTag && existingTag.get('id') !== tag.get('id')) {
        return NextResponse.json(
          { message: 'This physical card is already registered to another tag record.' }, 
          { status: 409 }
        );
      }
    }
    
    await tag.update(updateData);
    
    return NextResponse.json({ message: 'NFC Tag updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}


// =================================================================
// DELETE Handler
// =================================================================
// 💡 FIX 6: Use the fully strict return type (Union of expected successes/failures)
export async function DELETE(
  request: NextRequest, 
  context: RouteContext
): Promise<NfcTagResponse> {
  await initializeDatabase();
  
  const { id } = await context.params; 

  if (!id || id === 'undefined') {
    return NextResponse.json({ message: 'Tag ID is missing.' }, { status: 400 });
  }

  try {
    const tag: NfcTagModel | null = await db.NfcTag.findByPk(id); 

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