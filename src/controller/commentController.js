import Comment from "../models/comments/comment.js";
import CommentHomePage from "../models/comments/commentHomePage.js";
import Document from "../models/Document.js";

export const sendCommentController = async (req, res) => {
  try {
    const { documentId, text } = req.body;
    const userId = req.userId;
    if (!text || !documentId) {
      return res.status(400).json({
        success: false,
        message: "field is requried",
      });
    }

    const comment = await Comment.create({ text, documentId, userId });

    const populatedComment = await comment.populate("userId", "username image");

    return res.status(200).json({
      success: true,
      message: "Comment Successfully",
      data: populatedComment,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCommentsController = async (req, res) => {
  try {
    const { documentId } = req.params;

    const comments = await Comment.find({ documentId })
      .populate("userId", "username image")
      .sort({ createdAt: -1 });
    if (!comments || comments.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No comments found for this document",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "comment successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteCommentsController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment nahi mila!",
      });
    }

    const isOwner = comment.userId.toString() === userId.toString();
    const isAdmin = userRole?.toLowerCase() === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Aap unauthorized hain! Sirf owner ya admin delete kar sakta hai.",
      });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Comment successfully delete ho gaya.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// -------------------Comment Home Page Setup----------------------------
export const sendCommentHomePageController = async (req, res) => {
  try {
    const { text, documentId } = req.body;

    if (!text || text.trim() == "") {
      return res.status(400).json({
        success: false,
        message: "Comment text cannot be empty",
      });
    }

    if (!documentId) {
      return res.status(404).json({
        success: false,
        message: "Please Document Id Require",
      });
    }

    const doc = await Document.findById(documentId);

    if (!doc) {
      return res.status(400).json({
        success: false,
        message: "Document Id and Data base Id does not match",
      });
    }

    if (doc.visibility == "private") {
      return res.status(403).json({
        success: false,
        message: "This Document is private",
      });
    }
    const comment = await CommentHomePage.create({ text, documentId });

    res.status(200).json({
      success: true,
      message: "Send Comment Successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCommentHomePageController = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      return res.status(404).json({
        success: false,
        message: "Comment Id is Require"
      })
    }
    const { updateText } = req.body;
    const comment = await CommentHomePage.findByIdAndUpdate(
      commentId,
      { $set: { text: updateText } },
      { new: true },
    ).select("-password");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment Id Invalid"
      })
    }
    res.status(200).json({
      success: true,
      message: "Update Comment Successfully!",
      data: comment
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCommentsHomePageController = async (req, res) => {
  try {
    const { documentId } = req.params;

    const doc = await Document.findById(documentId);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (doc.visibility === "private") {
      return res.status(403).json({
        success: false,
        message: "This document is private.",
      });
    }
    const comments = await CommentHomePage.find({ documentId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Guest Comments Send Successfully",
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserCommentsHomePageController = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      return res.status(404).json({
        success: false,
        message: "Comment require",
      });
    }

    const comment = await CommentHomePage.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment Id is not provide",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment Get Successfully!",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

export const deleteUserCommentsHomePageController = async (req, res) => {
  console.log('===============>', req.params)
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(404).json({
        success: false,
        message: "comment id is not provide",
      });
    }

    const comment = await CommentHomePage.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment Id Invalid",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commend Delete Successfully!",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCommentsHomePageController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { role } = req.user;


    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Sirf Admin hi delete kar sakta hai",
      });
    }

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

    const comment = await CommentHomePage.findByIdAndDelete(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found in database",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully by Admin",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};