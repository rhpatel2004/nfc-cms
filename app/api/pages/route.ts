import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST: Create a new page
export async function POST(req: NextRequest) {
  try {
    await db.sequelize.authenticate(); 

    const { name, slug, content } = await req.json();

    if (!name || !slug || !content) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Check for a unique slug to prevent URL conflicts
    const existingPage = await db.Page.findOne({ where: { slug } });
    if (existingPage) {
      return NextResponse.json({ message: 'A page with this slug already exists.' }, { status: 409 });
    }

    const newPage = await db.Page.create({ name, slug, content });
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// GET: Fetch all pages
export async function GET() {
  try {
    await db.sequelize.authenticate(); 
    const pages = await db.Page.findAll();
    return NextResponse.json(pages, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}