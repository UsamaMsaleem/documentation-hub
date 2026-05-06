import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
    documentId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Document",
        required : true
    },
    fileUrl : {
        type : String,
        required : true
    },
    name: String,
    fileType: String,
    fileSize: Number,
    publicId: String
}, { timestamps: true });

export default mongoose.model('Attachment', attachmentSchema);