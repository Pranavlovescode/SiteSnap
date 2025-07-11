import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const secret = process.env.NEXTAUTH_SECRET!

export async function GET(req: NextRequest) {
  console.log('🔍 Cookies received:', req.cookies.getAll())

  const token = await getToken({ req, secret })

  if (!token) {
    console.log('❌ No token found from getToken')
    return NextResponse.json({ error: 'No token found' }, { status: 401 })
  }

  return NextResponse.json({ token })
}
