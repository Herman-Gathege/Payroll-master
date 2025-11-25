// frontend/src/services/documentService.js
import api from './api';

const EMPLOYEE_DOCS = '/employee/documents.php';
const EMPLOYER_DOCS = '/employer/employee_documents.php';

export const documentService = {

  // ---------------------------------------------------------
  // EMPLOYEE → UPLOAD DOCUMENT
  // ---------------------------------------------------------
  uploadMyDocument: async (file, title = '') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);

    const response = await api.post(EMPLOYEE_DOCS, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  },

  // ---------------------------------------------------------
  // EMPLOYEE → GET MY DOCUMENTS
  // ---------------------------------------------------------
  getMyDocuments: async () => {
    const response = await api.get(EMPLOYEE_DOCS);
    return response.data;
  },

  // ---------------------------------------------------------
  // EMPLOYER → GET EMPLOYEE DOCUMENTS
  // ---------------------------------------------------------
  getEmployeeDocuments: async (employeeId) => {
    const response = await api.get(`${EMPLOYER_DOCS}?employee_id=${employeeId}`);
    return response.data;
  }
};

export default documentService;
