import { Router } from "express";
import { webhookAuth } from "../middlewares/webhookAuth";
import { admin, protect } from "../middlewares/auth";
import {createOrderFromCart, deleteOrder, getAllOrdersAdmin, getOrderById, getCheckoutSummary, getOrders, updateOrderStatus } from "../controllers/order";

const router:Router = Router()

router.get('/admin', protect, admin, getAllOrdersAdmin)

router.get('/', protect, getOrders)
router.post('/', protect, createOrderFromCart)

router.get('/:id/checkout-summary', webhookAuth, getCheckoutSummary)
router.get('/:id', protect, getOrderById)
router.delete('/:id', protect, admin, deleteOrder)

router.put('/:id/status', protect, admin, updateOrderStatus)
router.put('/:id/webhook-status', webhookAuth, updateOrderStatus)


export default router;