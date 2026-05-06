import express from 'express';

import { uploadAttachment,  getAttachment, deleteAttachment, getAttachmentNOtLogin } from '../controller/attachmentController.js';
import { isAuthenticated } from '../midlewares/inAuthentication.js'

const router = express.Router();

router.post('/upload', isAuthenticated, uploadAttachment);
router.get('/:documentId', isAuthenticated,  getAttachment);
router.get('/homeAttachment/:documentId',  getAttachmentNOtLogin);
router.delete('/:id', isAuthenticated,  deleteAttachment);
export default router;

