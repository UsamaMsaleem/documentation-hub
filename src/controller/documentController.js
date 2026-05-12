import Document from "../models/Document.js";
import WorkspaceMember from '../models/WorkspaceMember.js';
import Category from '../models/Category.js';
import Workspace from '../models/Workspace.js';
import Attachment from '../models/Attachment.js';
import multipleUpload from '../utils/multipleUpload.js';
import User from "../models/auth/auth.js";


const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ---------------- CREATE DOCUMENT ----------------
export const createDocument = async (req, res) => {
    try {
        let { workspaceId, title, content, parentId, categoryId, tags, status, summary, visibility } = req.body;
        if (typeof tags === 'string') {
            try { tags = JSON.parse(tags); } catch (e) { tags = []; }
        }
        let attachments = [];

        if (req.files && req.files.length > 0) {
            attachments = await multipleUpload(req.files, `documents/${workspaceId}`);
        }

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const isGlobalAdmin = req.user.role === 'admin';
        const member = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.user._id
        });

        if (!member && !isGlobalAdmin) return res.status(403).json({ message: 'Access denied' });

        if (!isGlobalAdmin) {
            if (!['admin', 'editor'].includes(member.role)) {
                return res.status(403).json({ message: 'Not allowed to create document' });
            }
        }

        // Category validation
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category || String(category.workspaceId) !== String(workspaceId)) {
                return res.status(400).json({ message: "Invalid category for this workspace" });
            }
        }

        const slug = generateSlug(title);

        const doc = await Document.create({
            workspaceId,
            title,
            content: content || "",
            parentId: parentId || null,
            categoryId: categoryId || null,
            authorId: req.user._id,
            status: status || 'draft',
            tags: Array.isArray(tags) ? tags : [],
            slug,
            summary: summary || '',
            visibility: req.body.visibility || 'private'
        });

        // Create separate entries for each uploaded file
        if (attachments.length > 0) {
            const attachmentPromises = attachments.map(file => Attachment.create({
                documentId: doc._id,
                fileUrl: file.url,
                name: file.name,
                fileType: file.fileType,
                fileSize: file.fileSize,
                publicId: file.publicId
            }));
            await Promise.all(attachmentPromises);
        }

        res.status(201).json({
            message: `Document ${doc.status === 'draft' ? 'saved as draft' : 'created'}`,
            doc: doc.toObject()
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- UPDATE DOCUMENT ----------------
export const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, categoryId, tags, status, visibility } = req.body;

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const isGlobalAdmin = req.user.role === 'admin';
        const member = await WorkspaceMember.findOne({
            workspaceId: doc.workspaceId,
            userId: req.user._id
        });

        if (!member && !isGlobalAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!isGlobalAdmin) {
            if (!['admin', 'editor'].includes(member.role)) {
                return res.status(403).json({ message: 'Not allowed to update' });
            }
            // An editor in the workspace should be able to collaboratively edit any document
        }

        // Category validation
        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category || String(category.workspaceId) !== String(doc.workspaceId)) {
                return res.status(400).json({ message: "Invalid category for this workspace" });
            }
            doc.categoryId = categoryId;
        }

        if (title) {
            doc.title = title;
            doc.slug = generateSlug(title);
        }

        if (req.body.summary) doc.summary = req.body.summary;
        if (content) doc.content = content;
        if (tags) doc.tags = tags;
        if (status) doc.status = status;
        if (visibility) doc.visibility = visibility;

        if (req.files && req.files.length > 0) {
            const newAttachments = await multipleUpload(req.files, `documents/${doc.workspaceId}`);
            const attachmentPromises = newAttachments.map(file => Attachment.create({
                documentId: doc._id,
                fileUrl: file.url,
                name: file.name,
                fileType: file.fileType,
                fileSize: file.fileSize,
                publicId: file.publicId
            }));
            await Promise.all(attachmentPromises);
        }

        doc.lastUpdateBy = req.user._id;

        await doc.save();

        res.json({
            message: `Document ${doc.status === 'draft' ? 'saved as draft' : 'updated/published'}`,
            doc
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- GET USER DRAFTS ----------------
export const getUserDrafts = async (req, res) => {
    try {
        const drafts = await Document.find({
            authorId: req.user._id,
            status: 'draft'
        }).sort({ updatedAt: -1 });

        res.json(drafts);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- GET DOCUMENTS (PUBLISHED ONLY) ----------------
export const getDocuments = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const workspace = await Workspace.findById(workspaceId);

        const member = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.user._id
        });

        if (!member && workspace?.visibility !== 'public') return res.status(403).json({ message: 'Access denied' });

        const docs = await Document.find({
            workspaceId,
            status: 'published',
            $or: [
                { visibility: 'public' },
                { visibility: 'private' }
            ]
        }).populate('authorId', 'username email image').sort({ createdAt: -1 });

        res.json(docs);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- GET ALL PUBLIC DOCUMENTS ----------------
export const getAllPublicDocuments = async (req, res) => {
    try {
        const docs = await Document.find({
            status: 'published',
            visibility: 'public'
        }).populate('authorId', 'username email image').sort({ createdAt: -1 });

        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- GET SINGLE DOCUMENT ----------------
export const getSingleDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await Document.findById(id).populate('authorId', 'username email image');
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const member = await WorkspaceMember.findOne({
            workspaceId: doc.workspaceId,
            userId: req.user._id
        });

        // if (!member && doc.status === 'published' && doc.visibility === 'private') return res.status(403).json({ message: "Access denied" });
        if (!member && doc.status === 'published' && doc.visibility === 'private') return res.status(403).json({ message: "Access denied" });

        res.json(doc);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- DELETE DOCUMENT ----------------
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        const isGlobalAdmin = req.user.role === 'admin';
        const member = await WorkspaceMember.findOne({
            workspaceId: doc.workspaceId,
            userId: req.user._id
        });

        if (!member && !isGlobalAdmin) return res.status(403).json({ message: 'Access denied' });

        if (!isGlobalAdmin) {
            if (!['admin', 'editor'].includes(member.role)) {
                return res.status(403).json({ message: 'Not allowed to delete' });
            }
            if (member.role === 'editor' && !doc.authorId.equals(req.user._id)) {
                return res.status(403).json({ message: 'Editor can only delete their own documents' });
            }
        }

        await Document.findByIdAndDelete(id);
        res.json({ message: 'Document deleted' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- SEARCH BY TAG ----------------
export const searchDocumentsByTag = async (req, res) => {
    try {
        const { workspaceId, tag } = req.query;

        const member = await WorkspaceMember.findOne({
            workspaceId,
            userId: req.user._id
        });
        if (!member) return res.status(403).json({ message: "Access denied" });

        const docs = await Document.find({
            workspaceId,
            tags: tag,
            status: "published"
        }).sort({ createdAt: -1 });

        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------- GET ALL DOCUMENTS (ADMIN ONLY) ----------------
export const getAllDocumentsAdmin = async (req, res) => {
    try {
        const docs = await Document.find({})
            .populate('authorId', 'username email image')
            .populate('workspaceId', 'name')
            .sort({ createdAt: -1 });

        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//  public document  api 
export const getPublicDocuments = async (req, res) => {
    try {

        const docs = await Document.find({
            status: 'published',
            visibility: 'public'
        })
            .populate('workspaceId', 'name')
            .populate('authorId', 'username email')

            .sort({ createdAt: -1 });

        res.json(docs);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// public single doucment api

export const getPublicSingleDoc = async (req, res) => {
    try {
        const { slug } = req.params;

        const doc = await Document.findOne({
            slug,
            status: 'published',
            visibility: 'public'
        });

        if (!doc) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.json(doc);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getShareableLink = async (req, res) => {
    try {
        const { id } = req.params;

        const doc = await Document.findById(id);

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // sirf public ya published docs share hon
        if (doc.visibility !== "public" || doc.status !== "published") {
            return res.status(403).json({
                success: false,
                message: "This document is not shareable"
            });
        }

        const baseUrl = process.env.FRONTEND_URL || "https://document-sharing-zeta.vercel.app";

        const shareLink = `${baseUrl}/documentDetail/${doc.slug}`;

        return res.status(200).json({
            success: true,
            message: "Share link generated successfully",
            data: {
                shareLink
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





export const joinByLink = async (req, res) => {
  try {
    const {docs_id} = req.params;
    const {userId} = req.body;
    
    const doc = await Document.findById(docs_id);

   const member = await WorkspaceMember.findOneAndUpdate(
  {
    workspaceId: doc.workspaceId,
    userId: userId,
  },
  {
    $set: { role: "editor" }
  },
  {
      upsert: true,
      returnDocument: 'after'   
  }
);
 const user = await User.findOneAndUpdate(
  {
    _id: userId,
  },
  {
    $set: { role: "editor" }
  },
  {
      upsert: true,
      returnDocument: 'after'   
  }
);
    const baseUrl = process.env.FRONTEND_URL || "https://document-sharing-zeta.vercel.app";

        const shareLink = `${baseUrl}/doc/${docs_id}`;

        return res.status(200).json({
            success: true,
            message: "Share link generated successfully",
            data: {
                shareLink
            }
        });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
