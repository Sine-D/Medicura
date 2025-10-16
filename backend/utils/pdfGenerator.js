import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDF = (res, invoices) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${
      invoices.length === 1 ? `invoice_${invoices[0].id}` : "invoices"
    }.pdf"`
  );

  doc.pipe(res);

  invoices.forEach((inv, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // ===== HEADER =====
    const logoPath = path.join(__dirname, "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 });
    }

    doc.fontSize(24).fillColor("#2c3e50").font("Helvetica-Bold")
      .text("MediCura Medical Center", 0, 35, { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor("#7f8c8d").font("Helvetica")
      .text("123 Medical Street, City, Country | Tel: +94 77 123 4567", { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(18).fillColor("#16a085").font("Helvetica-Bold")
      .text("INVOICE", { align: "center" });
    
    // Horizontal line
    doc.moveTo(50, 100).lineTo(550, 100).strokeColor("#3498db").lineWidth(2).stroke();
    
    doc.moveDown(1.5);

    // ===== INVOICE INFO SECTION =====
    let y = 120;
    const leftCol = 50;
    const rightCol = 350;

    // Left column
    doc.fontSize(10).fillColor("#2c3e50").font("Helvetica-Bold")
      .text("Invoice Details:", leftCol, y);
    y += 18;
    
    doc.fontSize(10).fillColor("#000").font("Helvetica")
      .text("Invoice ID:", leftCol, y)
      .font("Helvetica-Bold")
      .text(inv.id, leftCol + 80, y);
    y += 15;
    
    doc.font("Helvetica")
      .text("Date:", leftCol, y)
      .font("Helvetica-Bold")
      .text(new Date(inv.date).toLocaleDateString('en-GB'), leftCol + 80, y);
    y += 15;
    
    doc.font("Helvetica")
      .text("Cashier ID:", leftCol, y)
      .font("Helvetica-Bold")
      .text(inv.cashierId || "N/A", leftCol + 80, y);

    // Right column - Patient info and Status
    y = 120;
    doc.fontSize(10).fillColor("#2c3e50").font("Helvetica-Bold")
      .text("Patient Information:", rightCol, y);
    y += 18;
    
    doc.fontSize(10).fillColor("#000").font("Helvetica")
      .text("Patient ID:", rightCol, y)
      .font("Helvetica-Bold")
      .text(inv.patientId, rightCol + 70, y);
    y += 20;
    
    // Status badge
    const statusColors = {
      paid: { bg: "#27ae60", text: "PAID" },
      unpaid: { bg: "#e74c3c", text: "UNPAID" },
      pending: { bg: "#f39c12", text: "PENDING" },
      cancelled: { bg: "#95a5a6", text: "CANCELLED" }
    };
    const statusInfo = statusColors[inv.status.toLowerCase()] || { bg: "#95a5a6", text: inv.status.toUpperCase() };
    
    doc.fontSize(9).font("Helvetica")
      .text("Status:", rightCol, y);
    doc.rect(rightCol + 45, y - 2, 70, 16).fillAndStroke(statusInfo.bg, statusInfo.bg);
    doc.fillColor("#fff").fontSize(9).font("Helvetica-Bold")
      .text(statusInfo.text, rightCol + 45, y + 1, { width: 70, align: "center" });

    y = 200;

    // ===== ITEMS TABLE =====
    const tableX = 50;
    const tableWidth = 500;
    const rowHeight = 25;
    const serviceX = tableX + 5;
    const qtyX = 320;
    const priceX = 390;
    const totalX = 470;

    // Table header
    doc.rect(tableX, y, tableWidth, rowHeight).fillAndStroke("#3498db", "#3498db");
    doc.fillColor("#fff").fontSize(10).font("Helvetica-Bold")
      .text("Service Description", serviceX, y + 8, { width: 240 })
      .text("Qty", qtyX, y + 8, { width: 50, align: "center" })
      .text("Price (Rs.)", priceX, y + 8, { width: 70, align: "right" })
      .text("Total (Rs.)", totalX, y + 8, { width: 70, align: "right" });

    y += rowHeight;

    // Table rows
    let subtotalCalculated = 0;

    if (inv.items && inv.items.length > 0) {
      inv.items.forEach((item, i) => {
        const itemTotal = (item.price * item.quantity);
        subtotalCalculated += itemTotal;

        // Alternate row colors
        if (i % 2 === 0) {
          doc.rect(tableX, y, tableWidth, rowHeight).fillOpacity(0.08).fillAndStroke("#ecf0f1", "#ddd");
        } else {
          doc.rect(tableX, y, tableWidth, rowHeight).fillOpacity(1).stroke("#ddd");
        }

        doc.fillOpacity(1).fillColor("#000").fontSize(9).font("Helvetica")
          .text(item.service || item.name || "N/A", serviceX, y + 8, { width: 240, lineBreak: false, ellipsis: true })
          .text(item.quantity.toString(), qtyX, y + 8, { width: 50, align: "center" })
          .text(item.price.toFixed(2), priceX, y + 8, { width: 70, align: "right" })
          .text(itemTotal.toFixed(2), totalX, y + 8, { width: 70, align: "right" });
        
        y += rowHeight;
      });
    } else {
      doc.rect(tableX, y, tableWidth, rowHeight).fillOpacity(0.08).fillAndStroke("#ecf0f1", "#ddd");
      doc.fillOpacity(1).fillColor("#95a5a6").fontSize(9).font("Helvetica-Oblique")
        .text("No items found", serviceX, y + 8, { width: tableWidth - 10, align: "center" });
      y += rowHeight;
    }

    y += 10;

    // ===== SUMMARY SECTION =====
    const summaryX = tableX + 280;
    const summaryWidth = 220;
    const summaryRowHeight = 22;

    // Use invoice values or calculate from items
    const subtotal = inv.subtotal || subtotalCalculated;
    const tax = inv.tax || Math.round(subtotal * 0.1); // 10% tax as per your form
    const total = inv.total || (subtotal + tax);

    // Subtotal
    doc.rect(summaryX, y, summaryWidth, summaryRowHeight).fillOpacity(0.05).fillAndStroke("#f8f9fa", "#ddd");
    doc.fillOpacity(1).fillColor("#000").fontSize(10).font("Helvetica")
      .text("Subtotal:", summaryX + 5, y + 6, { width: 120 })
      .font("Helvetica-Bold")
      .text(`Rs. ${subtotal.toFixed(2)}`, summaryX + 120, y + 6, { width: 95, align: "right" });
    y += summaryRowHeight;

    // Tax
    doc.rect(summaryX, y, summaryWidth, summaryRowHeight).fillOpacity(0.05).fillAndStroke("#f8f9fa", "#ddd");
    doc.fillOpacity(1).fillColor("#000").fontSize(10).font("Helvetica")
      .text("Tax (10%):", summaryX + 5, y + 6, { width: 120 })
      .font("Helvetica-Bold")
      .text(`Rs. ${tax.toFixed(2)}`, summaryX + 120, y + 6, { width: 95, align: "right" });
    y += summaryRowHeight;

    // Total with highlight
    doc.rect(summaryX, y, summaryWidth, summaryRowHeight + 5).fillAndStroke("#27ae60", "#27ae60");
    doc.fillColor("#fff").fontSize(12).font("Helvetica-Bold")
      .text("TOTAL:", summaryX + 5, y + 8, { width: 120 })
      .fontSize(14)
      .text(`Rs. ${total.toFixed(2)}`, summaryX + 120, y + 7, { width: 95, align: "right" });

    y += summaryRowHeight + 20;

    // ===== PAYMENT INFO =====
    if (inv.status.toLowerCase() === 'paid') {
      doc.fontSize(9).fillColor("#27ae60").font("Helvetica-Bold")
        .text("✓ Payment Received - Thank You!", summaryX, y, { width: summaryWidth, align: "center" });
    } else if (inv.status.toLowerCase() === 'unpaid') {
      doc.fontSize(9).fillColor("#e74c3c").font("Helvetica-Bold")
        .text("⚠ Payment Pending", summaryX, y, { width: summaryWidth, align: "center" });
    }

    // ===== FOOTER =====
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 120;

    // Terms and conditions
    doc.fontSize(8).fillColor("#7f8c8d").font("Helvetica")
      .text("Terms & Conditions:", 50, footerY, { continued: false })
      .fontSize(7)
      .text("Payment is due within 30 days. Late payments may incur additional charges.", 50, footerY + 12);

    // Signature line
    doc.fontSize(9).fillColor("#2c3e50").font("Helvetica")
      .text("Authorized Signature: ____________________", 350, footerY + 30);

    // Thank you message
    doc.fontSize(10).fillColor("#16a085").font("Helvetica-Bold")
      .text("Thank you for choosing MediCura Medical Center!", 0, footerY + 60, { 
        align: "center",
        width: doc.page.width
      });

    // Footer bar
    doc.moveTo(50, pageHeight - 30).lineTo(550, pageHeight - 30).strokeColor("#3498db").lineWidth(1).stroke();
    doc.fontSize(7).fillColor("#7f8c8d").font("Helvetica")
      .text("Generated on: " + new Date().toLocaleString('en-GB'), 0, pageHeight - 20, { 
        align: "center",
        width: doc.page.width
      });
  });

  doc.end();
};