import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { pin } = await req.json();
    const expectedPin = process.env.ADMIN_PIN ;

    if (!pin || String(pin).trim() !== String(expectedPin).trim()) {
      return NextResponse.json(
        { success: false, message: "Incorrect PIN. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PIN verified successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
