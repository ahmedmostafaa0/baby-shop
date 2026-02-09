import {Router} from 'express'
import { admin, protect } from '../middlewares/auth';
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from '../controllers/brand';

const router:Router = Router()

router.get('/', getBrands)
router.post('/', protect, admin, createBrand)

router.get('/:id', getBrandById)
router.put('/:id', protect, admin, updateBrand)
router.delete('/:id', protect, admin, deleteBrand)

export default router;
