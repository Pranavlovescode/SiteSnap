import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to delete a team" },
      { status: 401 }
    );
  }
  
  const url = new URL(req.url);
  const team_id = url.searchParams.get("team_id");
  
  if (!team_id) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    // Check if the user is an admin of this team
    const team = await prisma.team.findFirst({
      where: {
        id: team_id,
        adminId: session.user.id as string
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or you don't have permission to delete it" },
        { status: 403 }
      );
    }

    // First, remove all member associations
    await prisma.user.updateMany({
      where: {
        teamId: team_id
      },
      data: {
        teamId: null
      }
    });

    // Then delete the team
    await prisma.team.delete({
      where: {
        id: team_id
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
}
