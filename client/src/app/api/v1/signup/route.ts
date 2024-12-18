import { NextRequest, NextResponse } from "next/server";
import { SignUpSchema } from "@/types/index.js";
import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const parseData = SignUpSchema.safeParse(body);
        console.log(parseData)
        if (parseData.success) { 
            console.log("success")
            const {email,name ,password} = parseData.data;
            const hashPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: hashPassword
                }
            });
            return NextResponse.json({ message: "User created successfully" }, { status: 200 });
        } else {
            console.log("Validation errors:", parseData.error.errors);
            return NextResponse.json({ message: "Invalid data sorry" }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ message: "Error occurred while creating a user" }, { status: 500 });
    }
}