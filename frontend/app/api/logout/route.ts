import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Clear the access token and oauth state cookies
  cookieStore.delete("google_access_token");
  cookieStore.delete("google_oauth_state");
  
  return NextResponse.json({ success: true });
}

