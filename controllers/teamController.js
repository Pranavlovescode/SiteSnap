import { PrismaClient } from "@prisma/client";
// import { CreateTeamSchema } from "../types/index.js";
const prisma = new PrismaClient();

export const teamController = async (req, res) => {
  try {
    const body = req.body;
    const { adm_id } = req.query;

    console.log("Request body: ", body);
    console.log("Request Query params: ", adm_id);

    if (!body || !body.members || !Array.isArray(body.members)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Validate and fetch members
    const membersData = await Promise.all(
      body.members.map(async (email) => {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          throw new Error(`User with email ${email} does not exist.`);
        }

        return existingUser; // Return the user object
      })
    );

    console.log("Members data", membersData);

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: body.name,
        description: body.description,
        admin: {
          connect: { id: adm_id },
        },
        members: {
          connect: membersData.map((member) => ({ id: member.id })),
        },
      },
    });

    console.log("Team created: ", team);
    return res.status(201).json({ message: "Team created successfully", team });
  } catch (error) {
    console.error(error);
    if (error.message.startsWith("User with email")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
