import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

const createSchema = z.object({
  content: z.string().min(1).max(10000),
  mood: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).default([]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  prompt: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await requireSession()
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "500")
  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const wordCount = data.content.trim().split(/\s+/).filter(Boolean).length

    const entry = await prisma.journalEntry.upsert({
      where: { userId_date: { userId: session.user.id, date: data.date } },
      update: { ...data, wordCount },
      create: { ...data, userId: session.user.id, wordCount },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
