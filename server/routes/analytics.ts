import express, { Router } from "express";
import { admin, protect } from "../middlewares/auth";
import { getAnalyticsOverview, getInventoryAlerts, getProductAnalytics, getSalesAnalytics } from "../controllers/analytics";

const router: Router = express.Router();

router.use(protect);
router.use(admin);

router.get("/overview", getAnalyticsOverview);

router.get("/products", getProductAnalytics);

router.get("/sales", getSalesAnalytics);

router.get("/inventory-alerts", getInventoryAlerts);

export default router;