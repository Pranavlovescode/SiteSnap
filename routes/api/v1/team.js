import { Router } from "express";
const router = Router();
import { teamController } from "../../../controllers/teamController.js";
import verifyToken from "../../../middlewares/verifyToken.js";

router.post("/create", verifyToken, teamController);

export default router;