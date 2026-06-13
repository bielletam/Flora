import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

const createSchema = z.object({
  mood: z.number().min(1).max(5),
  note: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function GET(req: NextRequest) {
  const session = await requireSession()
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "30")
  const logs = await prisma.moodLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
  })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    await prisma.moodLog.deleteMany({ where: { userId: session.user.id, date: data.date } })
    const log = await prisma.moodLog.create({
      data: { ...data, userId: session.user.id },
    })
    return NextResponse.json(log, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
