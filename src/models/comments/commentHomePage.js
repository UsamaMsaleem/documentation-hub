import mongoose from 'mongoose'
import { string } from 'yup'

const commentHomePageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    }
}, {timestamps: true})

const CommentHomePage = mongoose.model("GuestComment", commentHomePageSchema)

export default  CommentHomePage