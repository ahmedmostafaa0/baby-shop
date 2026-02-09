import { Router } from "express";
import { protect } from "../middlewares/auth";
import { addItemToCart, clearCart, getCart, removeItemFromCart, updateCartItem } from "../controllers/cart";

const router:Router = Router()

router.use(protect)

router.get('/', getCart)
router.post('/', addItemToCart)
router.delete('/', clearCart)
router.put('/:productId', updateCartItem)
router.delete('/:productId', removeItemFromCart)


export default router;