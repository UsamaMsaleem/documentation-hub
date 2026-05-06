import mongoose from 'mongoose';

const workspaceMemberSchema = new mongoose.Schema({
   workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace'
   },
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'viewer'
   }
})

export default mongoose.model('WorkspaceMember', workspaceMemberSchema) 