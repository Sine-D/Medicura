import express from 'express';
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  exportPDF,
  exportExcel,
  exportPDFById,
  exportExcelById
} from '../controllers/InvoiceControllers.js';

const router = express.Router();

// IMPORTANT: Export routes MUST come before /:id routes to avoid conflicts
router.get("/export/pdf", exportPDF);
router.get("/export/excel", exportExcel);
router.get("/export/pdf/:id", exportPDFById);
router.get("/export/excel/:id", exportExcelById);

// CRUD routes
router.get("/", getAllInvoices);
router.post("/", createInvoice);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;