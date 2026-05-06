import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    description: String,
    visibility : {
        type : String,
        enum : ['private', 'team', 'public'],
        default : 'private'
    },
    ownerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
}, {timestamps : true});

export default mongoose.model('Workspace', workspaceSchema);

