import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    slug: { 
        type: String, 
        
        unique: true,
        sparse: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    workspaceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Workspace', 
        required: true 
    },
    visibility: { 
        type: String, 
        enum: ['public', 'private', 'team'], 
        default: 'private' 
    }
}, { timestamps: true });


documentSchema.index({ title: 'text' });

const Document = mongoose.model('Document', documentSchema);
export default Document;