import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest,res:NextResponse) {
    try {
        const getSessionCookie = req.cookies.get('session');
        // console.log("Session received",getSessionCookie)
        if(getSessionCookie){
            // console.log("Session received",getSessionCookie);            
            (await cookies()).set('session','',{
                expires:new Date(0)
            })
            return NextResponse.json({message:"Logout Successful"},{status:200})
        }else{
            return NextResponse.json({message:"No cookie found by this name"},{status:404})
        }
    } catch (error) {
        return NextResponse.json({message:"Error while Logging out"},{status:500})
    }
}