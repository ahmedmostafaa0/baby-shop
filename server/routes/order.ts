import { Router } from "express";
import { admin, protect } from "../middlewares/auth";
import {createOrderFromCart, deleteOrder, getAllOrdersAdmin, getOrderById, getOrders, updateOrderStatus } from "../controllers/order";

const router:Router = Router()

router.get('/admin', protect, admin, getAllOrdersAdmin)

router.get('/', protect, getOrders)
router.post('/', protect, createOrderFromCart)

router.get('/:id', protect, getOrderById)
router.delete('/:id', protect, deleteOrder)

router.put('/:id/status', protect, updateOrderStatus)
router.put('/:id/webhook-status', updateOrderStatus)


export default router;