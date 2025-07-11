import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: "Empty request body", status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON format", status: 400 });
    }

    const { name, email, password } = body;
    console.log("The signup request is: ", body);

    if (!name || !email || !password) {
      return NextResponse.json({
        error: "Missing required fields",
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    console.log("The new user is : ",newUser);
    // const sessionUser = await prisma.session.create({
    //   data:{
    //     sessionToken:newUser.id,
    //     userId:newUser.id,
    //     expires:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    //   }
    // })
    // console.log("session user",sessionUser);
    
    // const cookieStore = await cookies();
    // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    // cookieStore.set('session_cookie', sessionUser.sessionToken, {
    //   httpOnly: true,
    //   secure: true,
    //   expires: expiresAt,
    //   sameSite: 'lax',
    //   path: '/',
    // });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
