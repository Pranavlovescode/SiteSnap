
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        message: "You need to be signed in to create a team",
      },
      { status: 401 }
    );
  }
  if (!req.url) {
    return NextResponse.json(
      {
        message: "Invalid request URL",
      },
      { status: 400 }
    );
  }
  const url = new URL(req.url);
  const adm_id = url.searchParams.get("adm_id");
  const { name, description, code } = await req.json();
  const existingTeam = await prisma.team.findFirst({
    where: {
      code: code,
    },
  });
  const teamAdmin = await prisma.user.findFirst({
    where: {
      email: adm_id as string,
    },
  });
  if (!teamAdmin) {
    return NextResponse.json(
      {
        message: "Admin does not exist",
      },
      { status: 400 }
    );
  }

  if (existingTeam) {
    return NextResponse.json(
      {
        message: "Team with this code already exists",
      },
      { status: 400 }
    );
  }
  const team = await prisma.team.create({
    data: {
      name,
      description,
      code,
      admin: {
        connect: {
          id: teamAdmin.id as string,
        },
      },
    },
  });

  return NextResponse.json(team, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        message: "You need to be signed in to view a team",
      },
      { status: 401 }
    );
  }
  const teams = await prisma.team.findMany({
    where: {
      adminId: session.user.id,
    },
  });
  return NextResponse.json(teams, { status: 200 });
}
