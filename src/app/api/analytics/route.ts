import { NextResponse } from "next/server"
import { requireSession } from "@/lib/auth"
import { getAnalyticsData } from "@/lib/analytics"

export async function GET() {
  const session = await requireSession()
  const data = await getAnalyticsData(session.user.id)
  return NextResponse.json(data)
}
