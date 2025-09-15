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

  const body = await req.json();

  console.log("body: ",body)

  const { desc, teamName } = body;

  // Only return 400 if both are missing
  if (!desc && !teamName)
    return NextResponse.json({ error: "No body provided" }, { status: 400 });

  if (desc && !teamName) {
    const team = await prisma.team.update({
      where: {
        id: team_id as string,
      },
      data:{
        description:desc
      }
    });
    return NextResponse.json({msg:"Description of team changed"},{status:200});
  }

  if(teamName && !desc){
    const team = await prisma.team.update({
      where:{
        id:team_id as string
      },
      data:{
        name:teamName
      }
    });
    return NextResponse.json({msg:"Team name of team changed"},{status:200});
  }

  else{
    const team = await prisma.team.update({
      where:{
        id:team_id as string
      },
      data:{
        name:teamName,
        description:desc
      }
    });
    return NextResponse.json({msg:"Name and description of team changed"},{status:200});
  }

}
