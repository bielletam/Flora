import { NextResponse } from "next/server"
import { requireSession } from "@/lib/auth"
import { getWeeklyReport } from "@/lib/analytics"

export async function GET() {
  const session = await requireSession()
  const report = await getWeeklyReport(session.user.id)
  return NextResponse.json(report)
}
