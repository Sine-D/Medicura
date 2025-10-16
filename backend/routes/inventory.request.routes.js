import express from "express";
import {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRequestsByStatus,
  getRequestsByMedicine,
} from "../controllers/inventory.request.controller.js";

const router = express.Router();

// CRUD Routes
router.post("/", createRequest);
router.get("/", getAllRequests);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

// Specialized Query Routes
router.get("/filter/status", getRequestsByStatus);
router.get("/filter/medicine", getRequestsByMedicine);

export default router;
