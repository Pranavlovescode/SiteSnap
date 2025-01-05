import { Router } from "express";
const router = Router();
import { addNewMemberToExistingTeam, deleteTeamController, getTeamByIdController, removeMemberFromTeam, teamController } from "../../../controllers/teamController.js";
import verifyToken from "../../../middlewares/verifyToken.js";

router.post("/create/team", verifyToken, teamController);
router.get("/get/team", verifyToken,getTeamByIdController);
router.put("/update/team/members", verifyToken, addNewMemberToExistingTeam);
router.delete("/delete/team/members", verifyToken, removeMemberFromTeam);
router.delete("/delete/team",verifyToken, deleteTeamController)

export default router;