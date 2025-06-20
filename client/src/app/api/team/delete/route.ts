import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const team_id = url.searchParams.get("team_id");

  if (!team_id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await prisma.team.delete({
    where:{
      id:team_id
    }
  })

  return NextResponse.json({message:"Team deleted successfully"}, { status: 200 });
}
