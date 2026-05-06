import express from 'express';

import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from '../controller/categoryController.js'


import { isAuthenticated } from '../midlewares/inAuthentication.js'

const router = express.Router();

router.post('/', isAuthenticated, createCategory);

router.get('/:workspaceId', isAuthenticated, getCategories)

router.put('/:id', isAuthenticated, updateCategory);

router.delete('/:id', isAuthenticated, deleteCategory);

export default router;
