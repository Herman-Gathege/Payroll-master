import React, { useEffect, useState } from 'react';
import documentService from '../../services/documentService';

export default function EmployeeDocumentsView({ employeeId }) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    loadDocs();
  }, [employeeId]);

  const loadDocs = async () => {
    const res = await documentService.getEmployeeDocuments(employeeId);
    if (res.success) setDocs(res.data);
  };

  return (
    <div>
      <h3>Employee Documents</h3>

      <ul>
        {docs.map(doc => (
          <li key={doc.id}>
            <a href={`/${doc.file_path}`} target="_blank">
              {doc.title}
            </a>
            <span> — {doc.uploaded_at}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
