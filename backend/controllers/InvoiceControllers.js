import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import { generatePDF } from '../utils/pdfGenerator.js';
import { generateExcel } from '../utils/excelExporter.js';

// GET all invoices
export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.status(200).json({ invoices });
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json({ invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE invoice
export const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json({ invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to create invoice" });
  }
};

// UPDATE invoice
export const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json({ invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE invoice
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORT PDF (all invoices)
export const exportPDF = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    if (!invoices.length) return res.status(404).json({ message: "No invoices to export" });
    generatePDF(res, invoices);
  } catch (err) {
    console.error("Error exporting PDF:", err);
    res.status(500).json({ message: "Unable to export PDF" });
  }
};

// EXPORT Excel (all invoices)
export const exportExcel = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    if (!invoices.length) return res.status(404).json({ message: "No invoices to export" });
    await generateExcel(res, invoices);
  } catch (err) {
    console.error("Error exporting Excel:", err);
    res.status(500).json({ message: "Unable to export Excel" });
  }
};

// EXPORT PDF by ID
export const exportPDFById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    
    generatePDF(res, [invoice]);
  } catch (err) {
    console.error("Error exporting PDF:", err);
    res.status(500).json({ message: "Unable to export PDF" });
  }
};

// EXPORT Excel by ID
export const exportExcelById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid invoice ID" });

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    
    await generateExcel(res, [invoice]);
  } catch (err) {
    console.error("Error exporting Excel:", err);
    res.status(500).json({ message: "Unable to export Excel" });
  }
};