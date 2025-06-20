import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function PUT(req: NextRequest) {

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const team_id = url.searchParams.get("team_id");
  const code = url.searchParams.get("code");

  const body = await req.json();
  
  if (!team_id || !code)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (!Array.isArray(body.members) || body.members.length === 0)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  // Check the code from database
  const correctCode = await prisma.team.findUnique({
    where: {
      id: team_id as string,
    },
  });

  if (correctCode!.code !== code){
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

   // Validate and fetch members
  const membersData = await Promise.all(
    body.members.map(async (email:string) => {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        // res.status(400).json({error:"User with email does not exist"})
        return NextResponse.json({ error: "User with email does not exist" }, { status: 400 });
      }

      return existingUser; // Return the user object
    })
  );

  console.log("Members data", membersData);

  const membersToConnect = membersData.map((member) => ({ id: member.id }));

  const updatedTeam = await prisma.team.update({
    where: {
      id: team_id,
    },
    data: {
      members: {
        connect: membersToConnect,
      },
    },
  })

  console.log("Updated team",updatedTeam);

  return NextResponse.json({ message: "Team updated successfully" ,updatedTeam}, { status: 200 });


}
