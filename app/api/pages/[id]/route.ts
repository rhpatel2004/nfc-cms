import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Fetch a single page by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const page = await db.Page.findByPk(params.id);
    if (!page) {
      return NextResponse.json({ message: 'Page not found.' }, { status: 404 });
    }
    return NextResponse.json(page, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PUT: Update an existing page
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, content } = await req.json();
    const page = await db.Page.findByPk(params.id);

    if (!page) {
      return NextResponse.json({ message: 'Page not found.' }, { status: 404 });
    }

    await page.update({ name, content });
    return NextResponse.json({ message: 'Page updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// DELETE: Delete a page
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const page = await db.Page.findByPk(params.id);

    if (!page) {
      return NextResponse.json({ message: 'Page not found.' }, { status: 404 });
    }

    await page.destroy();
    return NextResponse.json({ message: 'Page deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}