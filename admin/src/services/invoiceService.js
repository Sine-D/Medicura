import axios from "axios";

const API_URL = "http://localhost:4000/api/invoices";

// Basic CRUD operations
export const getInvoices = () => axios.get(API_URL);

export const getInvoiceById = (id) => axios.get(`${API_URL}/${id}`);

export const createInvoice = (invoiceData) => axios.post(API_URL, invoiceData);

export const updateInvoice = (id, invoiceData) => 
  axios.put(`${API_URL}/${id}`, invoiceData);

export const deleteInvoice = (id) => axios.delete(`${API_URL}/${id}`);

// Export functions with proper responseType for file downloads
export const exportInvoicesPDF = () => 
  axios.get(`${API_URL}/export/pdf`, { 
    responseType: 'blob',
    timeout: 30000 // 30 second timeout for large files
  });

export const exportInvoicesExcel = () => 
  axios.get(`${API_URL}/export/excel`, { 
    responseType: 'blob',
    timeout: 30000
  });

export const exportInvoicePDFById = (id) => 
  axios.get(`${API_URL}/export/pdf/${id}`, { 
    responseType: 'blob',
    timeout: 30000
  });

export const exportInvoiceExcelById = (id) => 
  axios.get(`${API_URL}/export/excel/${id}`, { 
    responseType: 'blob',
    timeout: 30000
  });