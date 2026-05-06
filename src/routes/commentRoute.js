import express from 'express'
import { isAuthenticated } from '../midlewares/inAuthentication.js'
import { deleteCommentsController, deleteCommentsHomePageController, deleteUserCommentsHomePageController, getCommentsController, getCommentsHomePageController, getUserCommentsHomePageController, sendCommentController, sendCommentHomePageController, updateCommentHomePageController } from '../controller/commentController.js'

const commentRoute = express()

commentRoute.post('/send-Comment', isAuthenticated, sendCommentController)
commentRoute.get('/get-comments/:documentId', isAuthenticated, getCommentsController)
commentRoute.delete('/delete-comments/:id', isAuthenticated, deleteCommentsController)

// -------------------Comment Home Page Setup----------------------------
commentRoute.post('/send-comment-homepage', sendCommentHomePageController)
commentRoute.put('/update-comment-homepage/:commentId', updateCommentHomePageController)

commentRoute.get('/get-UserComment-homepage/:commentId', getUserCommentsHomePageController);
commentRoute.get('/get-comment-homepage/:documentId', isAuthenticated,  getCommentsHomePageController)

commentRoute.delete('/delete-UserComment-homepage/:commentId', deleteUserCommentsHomePageController);
commentRoute.delete('/delete-Comment-homepage/:commentId', isAuthenticated,  deleteCommentsHomePageController);


export default commentRoute