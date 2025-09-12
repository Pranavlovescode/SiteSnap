import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        message: "You need to be signed in to view a team",
      },
      { status: 401 }
    );
  }
  const team = await prisma.team.findMany({
    where: {
      adminId: session.user.id,
    },
    include: {
      photoData: true,
      members: {
        select: {
          id: true,
          name: true,
          email: true, // Include specific fields you need from members
        },
      },
    },
  });

  const finalTeams = team.map((t) => ({
    ...t,
    memberCount: t.members.length,
  }));
  if (team.length === 0) {
    return NextResponse.json(
      {
        message: "No teams found",
      },
      { status: 404 }
    );
  }
  return NextResponse.json(finalTeams, { status: 200 });
}
