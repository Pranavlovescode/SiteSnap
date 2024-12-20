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

export const getTeamByIdController = async (req, res) => {
  try {
    const { id } = req.query;
    console.log("Request Query params: ", id);
    const teams = await prisma.team.findFirst({
      where: {
        // It will find the team on the basis of team_id or if the user is a member of the team
        OR: [{ id: id }, { members: { some: { id: id } } }],
      },
      include: {
        admin: true,
        members: true,
      },
    });
    console.log("Teams: ", teams);
    return res
      .status(200)
      .json({ message: "Teams retrieved successfully !!", teams });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addNewMemberToExistingTeam = async (req, res) => {
  try {
    const { team_id } = req.query;
    const body = req.body;
    console.log("Request Query params: ", team_id);
    console.log("Request body: ", body);

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
          // res.status(400).json({error:"User with email does not exist"})
          throw new Error(`User with email ${email} does not exist.`);
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
    });
    console.log("Updated Team: ", updatedTeam);
    return res
      .status(200)
      .json({ message: "Members added successfully !!", updatedTeam });
  } catch (error) {
    console.log(error);
    if (error.message.startsWith("User with email")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMemberFromTeam = async (req, res) => {
  try {
    const { team_id } = req.query;
    const body = req.body;
    console.log("Request Query params: ", team_id);
    console.log("Request body: ", body);

    if (!body || !body.members || !Array.isArray(body.members)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const membersToDisconnect = body.members.map((memberId) => ({
      id: memberId,
    }));

    const updatedTeam = await prisma.team.update({
      where: {
        id: team_id,
      },
      data: {
        members: {
          disconnect: membersToDisconnect,
        },
      },
    });
    console.log("Updated Team: ", updatedTeam);
    return res
      .status(200)
      .json({ message: "Members removed successfully !!", updatedTeam });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTeamController = async (req, res) => {
  try {
    const { team_id } = req.query;
    console.log("Request Query params: ", team_id);
    
    // Find the team and get all the members
    const getTeam = await prisma.team.findUnique({
      where:{
        id:team_id,
      },
      include:{
        admin:true,
        members:true
      }
    })

    const teamMembers = getTeam.members.map((member)=>member.id);

    // Disconnect all the members from the team
    await prisma.team.update({
      where:{
        id:team_id
      },
      data:{
        members:{
          disconnect:teamMembers.map((memberId)=>({id:memberId}))
        }
      }
    })

    // Delete the team
    const deletedTeam = await prisma.team.delete({
      where: {
        id: team_id,
      },
    });

    console.log("Deleted Team: ", deletedTeam);
    return res
      .status(200)
      .json({ message: "Team deleted successfully !!", deletedTeam });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
