import { Router } from "express";
import { protect } from "../middlewares/auth";
import { getStats } from "../controllers/stats";

const router:Router = Router()

router.get('/', protect, getStats)


export default router;