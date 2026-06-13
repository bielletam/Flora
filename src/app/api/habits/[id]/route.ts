import { NextRequest, NextResponse } from "next/server"
import { requireSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession()
  const body = await req.json()

  const habit = await prisma.habit.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.habit.update({ where: { id: params.id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireSession()

  const habit = await prisma.habit.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.habit.update({ where: { id: params.id }, data: { isActive: false } })
  return new NextResponse(null, { status: 204 })
}
