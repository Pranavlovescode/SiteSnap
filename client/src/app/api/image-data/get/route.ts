import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const team_id = url.searchParams.get("teamId");
  const images = await prisma.photoData.findMany({
    where: {
      teamId: team_id as string,
    },
    include: {
      user: true,
      team: true,
    },
  });
  if (!images) {
    return NextResponse.json(
      {
        message: "No images found",
      },
      { status: 404 }
    );
  }
  return NextResponse.json({images}, { status: 200 });
}
