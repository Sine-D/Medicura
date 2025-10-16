import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export const generateEnhancedInvoicePDF = (invoice) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [37, 99, 235]; // Blue
  const secondaryColor = [107, 114, 128]; // Gray
  const accentColor = [16, 185, 129]; // Green
  const lightGray = [249, 250, 251];
  const darkGray = [31, 41, 55];
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Company Logo/Name Area
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICURA", 20, 25);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Pharmaceutical Supply Chain", 20, 35);
  
  // Invoice Title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  const invoiceTitle = "INVOICE";
  const titleWidth = doc.getTextWidth(invoiceTitle);
  doc.text(invoiceTitle, pageWidth - titleWidth - 20, 30);
  
  // Invoice Details Box
  doc.setFillColor(...lightGray);
  doc.rect(pageWidth - 80, 55, 70, 35, 'F');
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice ID:", pageWidth - 75, 65);
  doc.text("Date:", pageWidth - 75, 75);
  doc.text("Status:", pageWidth - 75, 85);
  
  doc.setFont("helvetica", "normal");
  const invoiceId = invoice._id || invoice.id || "N/A";
  const shortId = invoiceId.length > 12 ? invoiceId.substring(0, 12) + "..." : invoiceId;
  doc.text(shortId, pageWidth - 75, 70);
  
  const currentDate = new Date().toLocaleDateString();
  doc.text(currentDate, pageWidth - 75, 80);
  
  // Status with color
  const status = invoice.status || "Pending";
  if (status.toLowerCase() === "approved") {
    doc.setTextColor(...accentColor);
  } else if (status.toLowerCase() === "pending") {
    doc.setTextColor(245, 158, 11); // Yellow
  } else {
    doc.setTextColor(239, 68, 68); // Red
  }
  doc.setFont("helvetica", "bold");
  doc.text(status.toUpperCase(), pageWidth - 75, 90);
  
  // Company Information
  doc.setTextColor(...darkGray);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("From:", 20, 65);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Medicura Pharmaceutical Ltd.", 20, 75);
  doc.text("123 Medical District", 20, 82);
  doc.text("Colombo 07, Sri Lanka", 20, 89);
  doc.text("Phone: +94 11 234 5678", 20, 96);
  doc.text("Email: info@medicura.lk", 20, 103);
  
  // Items Table Header
  let currentY = 120;
  
  doc.setFillColor(...primaryColor);
  doc.rect(20, currentY, pageWidth - 40, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("MEDICINE", 25, currentY + 8);
  doc.text("PRICE ($)", 80, currentY + 8);
  doc.text("QTY", 120, currentY + 8);
  doc.text("TOTAL ($)", 150, currentY + 8);
  
  currentY += 12;
  
  // Items Table Body
  let subtotal = 0;
  const items = invoice.items || [];
  
  items.forEach((item, index) => {
    const itemTotal = (item.price || 0) * (item.quantity || 0);
    subtotal += itemTotal;
    
    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, currentY, pageWidth - 40, 10, 'F');
    }
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    // Truncate long medicine names
    const medicineName = item.name || "Unknown Medicine";
    const truncatedName = medicineName.length > 20 ? medicineName.substring(0, 20) + "..." : medicineName;
    
    doc.text(truncatedName, 25, currentY + 7);
    doc.text((item.price || 0).toFixed(2), 80, currentY + 7);
    doc.text((item.quantity || 0).toString(), 120, currentY + 7);
    doc.text(itemTotal.toFixed(2), 150, currentY + 7);
    
    currentY += 10;
  });
  
  // Add some spacing
  currentY += 10;
  
  // Summary Section
  const summaryStartX = pageWidth - 100;
  
  // Subtotal
  doc.setFillColor(...lightGray);
  doc.rect(summaryStartX - 10, currentY, 90, 8, 'F');
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", summaryStartX, currentY + 6);
  doc.text(`$${subtotal.toFixed(2)}`, summaryStartX + 50, currentY + 6);
  
  currentY += 8;
  
  // Tax (if applicable)
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  
  doc.text("Tax (8%):", summaryStartX, currentY + 6);
  doc.text(`$${taxAmount.toFixed(2)}`, summaryStartX + 50, currentY + 6);
  
  currentY += 8;
  
  // Total
  const totalAmount = subtotal + taxAmount;
  
  doc.setFillColor(...primaryColor);
  doc.rect(summaryStartX - 10, currentY, 90, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", summaryStartX, currentY + 8);
  doc.text(`$${totalAmount.toFixed(2)}`, summaryStartX + 50, currentY + 8);
  
  currentY += 20;
  
  // Footer Section
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 30;
  }
  
  // Terms and Conditions
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Terms & Conditions:", 20, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.text("• Payment is due within 30 days of invoice date", 20, currentY + 8);
  doc.text("• All medicines are subject to quality assurance", 20, currentY + 15);
  doc.text("• Returns must be made within 7 days of delivery", 20, currentY + 22);
  doc.text("• Please retain this invoice for your records", 20, currentY + 29);
  
  // Footer Bar
  const footerY = pageHeight - 25;
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", 20, footerY + 10);
  doc.text("www.medicura.lk | support@medicura.lk | +94 11 234 5678", 20, footerY + 18);
  
  // Page number (if multiple pages)
  doc.setFontSize(8);
  doc.text(`Page 1`, pageWidth - 30, footerY + 15);
  
  // Save the PDF
  const fileName = `invoice-${shortId}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return doc;
};

// Alternative function for generating invoice preview (without saving)
export const generateInvoicePreview = (invoice) => {
  const doc = generateEnhancedInvoicePDF(invoice);
  return doc.output('datauristring');
};

// Function to generate and email invoice (returns base64)
export const generateInvoiceForEmail = (invoice) => {
  const doc = generateEnhancedInvoicePDF(invoice);
  return doc.output('datauri');
};
