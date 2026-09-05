import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // 1 - 12
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const upcomingOnly = searchParams.get('upcomingOnly');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const id = searchParams.get('id') || searchParams.get('eventId');
    if (id) {
      const event = await Event.findById(id).lean();
      return NextResponse.json({ success: true, event, events: event ? [event] : [] });
    }

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = { $ne: 'cancelled' };
    }

    if (month && year) {
      const m = parseInt(month, 10) - 1;
      const y = parseInt(year, 10);
      const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      query.startDate = { $gte: start, $lte: end };
    } else if (upcomingOnly === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.startDate = { $gte: today };
    }

    const events = await Event.find(query).sort({ startDate: 1 }).limit(limit).lean();
    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch events' }, { status: 500 });
  }
}
