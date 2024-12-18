import { NextRequest, NextResponse } from "next/server";
import { SignInSchema } from "@/types/index";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { generateSessions } from "@/lib/generateSessions";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const parseData = SignInSchema.safeParse(body);
        if (parseData.success) {
            const { email, password } = parseData.data;
            const userfound = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
            if (userfound) {
                const isPasswordValid = await bcrypt.compare(
                    password,
                    userfound.password!
                );
                if (isPasswordValid) {
                    // const token = jwt.sign({ email: email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
                    const response = NextResponse.json(
                        { message: "Login Successful" },
                        { status: 200 }
                    );

                    const cookie = await generateSessions(parseData.data);
                    console.log("cookie generated", cookie);
                    return response;
                } else {
                    return NextResponse.json(
                        { message: "Invalid Credentials" },
                        { status: 404 }
                    );
                }
            } else {
                return NextResponse.json(
                    { message: "User not found" },
                    { status: 404 }
                );
            }
        } else {
            return NextResponse.json(
                { message: "Invalid data", errors: parseData.error.errors },
                { status: 400 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: "Error occurred while logging in" },
            { status: 500 }
        );
    }
};
