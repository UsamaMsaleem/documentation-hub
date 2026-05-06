import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    tags: {
        type: [String],
        default: [],
    },
    slug: {
        type: String,
    },
    summary: {
        type: String,
        default: ''
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    lastUpdateBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });


if (mongoose.models.Document) {
    delete mongoose.models.Document;
}

const Document = mongoose.model('Document', documentSchema);

export default Document;        