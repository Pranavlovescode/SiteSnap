import { encrypt } from "./sessions";
import { cookies } from "next/headers";

type SessionPayload = {
    email: string,
    password: string
}

export async function generateSessions(userId:SessionPayload) {
    const session = await encrypt(userId)
    const cookie = await cookies();
    return cookie.set('session',session,{
        httpOnly:true,
        sameSite:'lax',
        expires:new Date(Date.now()+1000*60*60*24),
        path:'/'
    })
}