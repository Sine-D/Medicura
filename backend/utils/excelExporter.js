import ExcelJS from 'exceljs';

export const generateExcel = async (res, invoices) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Invoices");

  // Define columns
  sheet.columns = [
    { header: "Invoice ID", key: "id", width: 15 },
    { header: "Patient ID", key: "patientId", width: 20 },
    { header: "Cashier ID", key: "cashierId", width: 20 },
    { header: "Date", key: "date", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Item Name", key: "itemName", width: 30 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Price (Rs.)", key: "price", width: 15 },
    { header: "Item Total (Rs.)", key: "itemTotal", width: 15 },
    { header: "Invoice Total (Rs.)", key: "total", width: 18 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3498db' }
  };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Add data
  invoices.forEach(inv => {
    if (inv.items && inv.items.length > 0) {
      inv.items.forEach((item, index) => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        sheet.addRow({
          id: index === 0 ? inv.id : "",
          patientId: index === 0 ? inv.patientId : "",
          cashierId: index === 0 ? (inv.cashierId || "N/A") : "",
          date: index === 0 ? new Date(inv.date).toLocaleDateString() : "",
          status: index === 0 ? inv.status : "",
          itemName: item.service || item.name || "N/A",
          quantity: item.quantity,
          price: item.price.toFixed(2),
          itemTotal: itemTotal,
          total: index === 0 ? inv.total.toFixed(2) : "",
        });
      });
    } else {
      // If no items, add invoice info only
      sheet.addRow({
        id: inv.id,
        patientId: inv.patientId,
        cashierId: inv.cashierId || "N/A",
        date: new Date(inv.date).toLocaleDateString(),
        status: inv.status,
        itemName: "No items",
        quantity: 0,
        price: 0,
        itemTotal: 0,
        total: inv.total.toFixed(2),
      });
    }
  });

  // Set response headers
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${
      invoices.length === 1 ? `invoice_${invoices[0].id}` : "invoices"
    }.xlsx"`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  // Write to response
  await workbook.xlsx.write(res);
  res.end();
};