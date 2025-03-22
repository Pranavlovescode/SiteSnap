import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const team_id = url.searchParams.get("team_id");
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {
        message: "You need to be signed in to view a team",
      },
      { status: 401 }
    );
  }
  if (!team_id) {
    return NextResponse.json(
      {
        message: "Invalid team ID",
      },
      { status: 400 }
    );
  }
  const team = await prisma.team.findFirst({
    where: {
      id: team_id,
    },
    include:{
      photoData:true
    }
  });
  if (!team) {
    return NextResponse.json(
      {
        message: "Team not found",
      },
      { status: 404 }
    );
  }
  return NextResponse.json(team, { status: 200 });
}
