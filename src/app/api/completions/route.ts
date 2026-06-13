import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getLast28Days } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const session = await requireSession()
  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "28")
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toISOString().slice(0, 10)
  })

  const completions = await prisma.habitCompletion.findMany({
    where: { userId: session.user.id, date: { in: dates } },
  })

  const byDate = dates.reduce<Record<string, string[]>>((acc, date) => {
    acc[date] = completions.filter((c) => c.date === date).map((c) => c.habitId)
    return acc
  }, {})

  return NextResponse.json(byDate)
}

export async function POST(req: NextRequest) {
  const session = await requireSession()
  const { habitId, date } = await req.json()

  if (!habitId || !date) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: session.user.id } })
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 })

  const completion = await prisma.habitCompletion.upsert({
    where: { habitId_date: { habitId, date } },
    update: {},
    create: { habitId, userId: session.user.id, date },
  })
  return NextResponse.json(completion, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await requireSession()
  const { habitId, date } = await req.json()

  await prisma.habitCompletion.deleteMany({
    where: { habitId, userId: session.user.id, date },
  })
  return new NextResponse(null, { status: 204 })
}
