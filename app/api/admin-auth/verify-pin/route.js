import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { pin } = await req.json();
    const expectedPin = process.env.ADMIN_PIN ;

    if (!pin || String(pin).trim() !== String(expectedPin).trim()) {
      return NextResponse.json(
        { success: false, message: "Wrong PIN. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PIN verified.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
