import Workspace from '../models/Workspace.js';

import User from '../models/auth/auth.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { sendInvitationEmail } from '../Email/email.js';

export const createWorkspace = async (req, res) => {
    try {
        const { name, description, visibility } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Name is required'
            });
        };

        const workspace = await Workspace.create({
            name,
            description,
            visibility,
            ownerId: req.user._id
        });

        await WorkspaceMember.create({
            workspaceId: workspace._id,
            userId: req.user._id,
            role: 'admin'
        });

        res.status(200).json({
            message: 'Workspace created',
            workspace
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

export const getUserWorkspaces = async (req, res) => {
    try {
        const role = req.user.role;
        const isGlobalAdmin = role === 'admin';
        
        if (isGlobalAdmin) {
            // Global admins see all workspaces
            const allWorkspaces = await Workspace.find({});
            return res.json(allWorkspaces);
        }
        
        const membership = await WorkspaceMember.find({
            userId: req.user._id,
        }).populate('workspaceId');

        const memberWorkspaces = membership.map(m => m.workspaceId).filter(w => w !== null);

        if (role === 'editor') {
            // Editors should ONLY see workspaces they are assigned to
            return res.json(memberWorkspaces);
        } else {
            // Viewers see public workspaces + any they are explicitly assigned to
            const publicWorkspaces = await Workspace.find({ visibility: 'public' });
            const map = new Map();
            publicWorkspaces.forEach(w => map.set(w._id.toString(), w));
            memberWorkspaces.forEach(w => map.set(w._id.toString(), w));
            return res.json(Array.from(map.values()));
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const addMember = async (req, res) => {
    try {
        const { workspaceId, email, role } = req.body;

        const isGlobalAdmin = req.user.role === 'admin';
        const adminCheck = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.user._id,
            role: 'admin'
        });

        if (!adminCheck && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'Only admin can add members'
            })
        };

        const user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist, send invitation email
            try {
                await sendInvitationEmail(email);
                return res.json({ 
                    message: 'Invitation email sent to new user',
                    invited: true 
                });
            } catch (emailError) {
                return res.status(500).json({ message: 'Failed to send invitation email' });
            }
        };

        const exists = await WorkspaceMember.findOne({
            workspaceId,
            userId : user._id
        });

        if(exists) {
            return res.status(400).json({
                message : 'User already a member'
            })
        };
        
        await WorkspaceMember.create({
            workspaceId,
            userId: user._id,
            role
        });

        res.json({ message: 'Member added' });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

export const getSingleWorkspace = async (req, res) => {
    try {
        const { id } = req.params;

        const workspace = await Workspace.findById(id);
        if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

        const isGlobalAdmin = req.user.role === 'admin';
        const member = await WorkspaceMember.findOne({
            workspaceId: id,
            userId: req.user._id
        });

        if (!member && workspace.visibility !== 'public' && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        const members = await WorkspaceMember.find({
            workspaceId: id
        }).populate('userId', 'username email');

        res.json({
            workspace,
            members
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { workspaceId, userId } = req.body;

        const isGlobalAdmin = req.user.role === 'admin';
        const adminCheck = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.user._id,
            role: 'admin'
        });

        if (!adminCheck && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'only admin can remove members'
            })
        };

        // owner ko remove na hone do 
        const workspace = await Workspace.findById(workspaceId);

        if (workspace.ownerId.toString() === userId) {
            return res.status(400).json({
                message: 'Cannot remove workspace owner'
            })
        };

        await WorkspaceMember.findOneAndDelete({
            workspaceId,
            userId
        });

        res.json({
            message: 'Member removed'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    };
};

export const updateWorkspace = async (req, res) => {

    try {
        const { id } = req.params;

        const isGlobalAdmin = req.user.role === 'admin';
        const adminCheck = await WorkspaceMember.findOne({
            workspaceId: id,
            userId: req.user._id,
            role: 'admin'
        });

        if (!adminCheck && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'Only admin can update workspace'
            })
        };

        const workspace = await Workspace.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({
            message: 'Workspace update',
            workspace
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};

export const deleteWorkspace = async (req, res) => {
    try {
        const { id } = req.params;

        const isGlobalAdmin = req.user.role === 'admin';
        const adminCheck = await WorkspaceMember.findOne({
            workspaceId: id,
            userId: req.user._id,
            role: 'admin'
        });

        if (!adminCheck && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'Only admin can delete workspace'
            })
        };

        await Workspace.findByIdAndDelete(id);


        await WorkspaceMember.deleteMany({
            workspaceId: id
        });

        res.json({
            message: 'Workspace deleted'
        });


    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};