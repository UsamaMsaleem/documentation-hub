import Attachment from '../models/Attachment.js';
import Document from '../models/Document.js';
import WorkspaceMember from '../models/WorkspaceMember.js'

export const uploadAttachment = async (req, res) => {
    try {
        const { documentId, fileType } = req.body

        const fileUrl = req.file?.path || req.body.fileUrl

        if (!documentId || !fileUrl || !fileType) {
            return res.status(400).json({
                message: 'documentId, fileUrl, fileType required'
            })
        }

        const doc = await Document.findById(documentId);

        if (!doc) {
            return res.statsu(404).json({
                message: 'Document not found'
            })
        };

        const isGlobalAdmin = req.user.role === 'admin';
        const member = await WorkspaceMember.findOne({
            workspaceId: doc.workspaceId,
            userId: req.user._id
        });

        if (!member && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'Access denied'
            })
        };

        if (!isGlobalAdmin) {
            if (!['admin', 'editor'].includes(member.role)) {
                return res.status(403).json({
                    message: 'Not allowed to add attachment'
                })
            }
        }

        const attachment = await Attachment.create({
            documentId,
            fileUrl,
            fileType
        });

        res.status(201).json({
            message: "Attachment uploaded",
            attachment
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const getAttachment = async (req, res) => {
    try {
        const { documentId } = req.params;

        const doc = await Document.findById(documentId);
        if (!doc) {
            return res.status(404).json({
                message: 'Document not found'
            })
        };

        const isGlobalAdmin = req.user.role === 'admin';    
        const member = await WorkspaceMember.findOne({
            workspaceId: doc.workspaceId,
            userId: req.user._id
        });

        // if (!member && !isGlobalAdmin) {
        //     return res.status(403).json({
        //         message: 'Access denied'
        //     })
        // };

        const attachment = await Attachment.find({ documentId }).sort({ createdAt: 1 })
// console.log(attachment)
        // res.json(attachment,isGlobalAdmin,member);
        res.json({
  attachments: attachment,
  isGlobalAdmin,
  member
});
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const deleteAttachment = async (req, res) => {
    try {
        const { id } = req.params;

        const attachment = await Attachment.findById(id);
        if (!attachment) return res.status(404).json({
            message: 'Attachment not found'
        });

        const doc = await Document.findById(attachment.documentId);

        if (!doc) return res.status(404).json({
            message: 'Document not found'
        });

        const isGlobalAdmin = req.user.role === 'admin';
        const member = await WorkspaceMember.findOne({
            workspaceId: doc.workspaceId,
            userId: req.user._id
        });

        if (!member && !isGlobalAdmin) {
            return res.status(403).json({
                message: 'Access denied'
            })
        };

        if (!isGlobalAdmin) {
            if (!['admin', 'editor'].includes(member.role)) {
                return res.status(403).json({
                    message: 'Not allowed to delete attachment'
                })
            }
        }

        await Attachment.findByIdAndDelete(id);
        res.json({
            message: 'Attachment deleted'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
}

//get attachemnts whithout login added by usama

export const getAttachmentNOtLogin = async (req, res) => {
    try {
        const { documentId } = req.params;

        const doc = await Document.findById(documentId);
        if (!doc) {
            return res.status(404).json({
                message: 'Document not found'
            })
        };
        const attachment = await Attachment.find({ documentId }).sort({ createdAt: 1 })
        res.json(attachment);
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}