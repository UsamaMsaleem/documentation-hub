import express from 'express';

import {
    createWorkspace,
    getUserWorkspaces,
    addMember,
    removeMember,
    getSingleWorkspace,
    updateWorkspace,
    deleteWorkspace
} from '../controller/workspaceController.js'

import { isAuthenticated } from '../midlewares/inAuthentication.js'

const router = express.Router();

router.post('/', isAuthenticated, createWorkspace);

router.post('/add-member', isAuthenticated, addMember);
router.delete('/remove-member', isAuthenticated, removeMember)

router.get('/', isAuthenticated, getUserWorkspaces);
router.get('/:id', isAuthenticated, getSingleWorkspace);


router.put('/:id', isAuthenticated, updateWorkspace);
router.delete('/:id', isAuthenticated, deleteWorkspace);


export default router  