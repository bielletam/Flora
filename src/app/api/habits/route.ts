import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireSession } from "@/lib/auth"
import { getHabitStats } from "@/lib/analytics"
import prisma from "@/lib/prisma"

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  icon: z.string().default("📌"),
  color: z.string().default("#3EC9A7"),
  category: z.string().default("General"),
  frequency: z.string().default("daily"),
  targetDays: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
})

export async function GET(req: NextRequest) {
  const session = await requireSession()
  const withStats = req.nextUrl.searchParams.get("stats") === "1"

  if (withStats) {
    const habits = await getHabitStats(session.user.id)
    return NextResponse.json(habits)
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(habits)
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const habit = await prisma.habit.create({
      data: { ...data, userId: session.user.id },
    })
    return NextResponse.json(habit, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
