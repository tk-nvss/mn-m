import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import jwt from 'jsonwebtoken';

function adminAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(req) {
  try {
    const user = adminAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const events = await Event.find({}).sort({ startDate: -1 }).lean();
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error in GET /api/admin/events:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = adminAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    if (!body.title || !body.startDate) {
      return NextResponse.json({ success: false, message: 'Title and Start Date are required' }, { status: 400 });
    }
    const event = await Event.create({
      title: body.title,
      description: body.description || '',
      image: body.image || '',
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      game: body.game || 'MLBB',
      eventType: body.eventType || 'In-Game Event',
      link: body.link || '',
      location: body.location || 'Online',
      isFeatured: !!body.isFeatured,
      status: body.status || 'active',
      color: body.color || '#3b82f6',
    });
    return NextResponse.json({ success: true, event, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error in POST /api/admin/events:', error);
    return NextResponse.json({ success: false, message: 'Failed to create event' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = adminAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Event ID is required' }, { status: 400 });
    }
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    const event = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, event, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error in PATCH /api/admin/events:', error);
    return NextResponse.json({ success: false, message: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const user = adminAuth(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Event ID is required' }, { status: 400 });
    }
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/events:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete event' }, { status: 500 });
  }
}
