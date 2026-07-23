import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

const rateLimit = new Map<string, { count: number; reset: number }>()
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const maxRequests = 10
  const current = rateLimit.get(userId)
  if (!current || now > current.reset) {
    rateLimit.set(userId, { count: 1, reset: now + windowMs })
    return true
  }
  if (current.count >= maxRequests) return false
  current.count++
  return true
}

  export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Ruta deshabilitada" }, { status: 403 })
}
export const maxDuration = 60
