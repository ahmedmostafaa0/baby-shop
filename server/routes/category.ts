import {Router} from 'express'
import { admin, protect } from '../middlewares/auth';
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from '../controllers/category';


const router:Router = Router()

router.get('/', getCategories)
router.post('/', protect, admin, createCategory)

router.get('/:id', getCategoryById)
router.put('/:id', protect, admin, updateCategory)
router.delete('/:id', protect, admin, deleteCategory)

export default router;
