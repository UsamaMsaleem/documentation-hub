import express from "express";
import { isAuthenticated, isAdmin } from "../midlewares/inAuthentication.js";

import {
  createDocument,
  deleteDocument,
  getDocuments,
  getSingleDocument,
  updateDocument,
  searchDocumentsByTag,
  getUserDrafts,
  getPublicDocuments,
  getPublicSingleDoc,
  getAllPublicDocuments,
  getAllDocumentsAdmin,
  getShareableLink,
  joinByLink,
} from "../controller/documentController.js";
import upload from "../utils/multer.js";

const router = express.Router();

//Create
router.post(
  "/",
  isAuthenticated,
  upload.array("attachments", 10),
  createDocument,
);

//Get Single
router.get("/single/:id", isAuthenticated, getSingleDocument);

//Get All Public
router.get("/public", getAllPublicDocuments);

//Get All (Admin Master View)
router.get("/admin/all", isAuthenticated, isAdmin, getAllDocumentsAdmin);

//  draft all get
router.get("/documents/drafts", isAuthenticated, getUserDrafts);

router.get("/search/by-tag", isAuthenticated, searchDocumentsByTag);

//Get All (in a workspace)
router.get("/:workspaceId", isAuthenticated, getDocuments);
//Update
router.put(
  "/:id",
  isAuthenticated,
  upload.array("attachments", 10),
  updateDocument,
);

//Delete
router.delete("/:id", isAuthenticated, deleteDocument);

router.get("/public/documents", getPublicDocuments);

router.get("/public/document/:slug", getPublicSingleDoc);

router.get("/share/:id", getShareableLink);

router.post("/joinshare/:docs_id", isAuthenticated, joinByLink);

export default router;
