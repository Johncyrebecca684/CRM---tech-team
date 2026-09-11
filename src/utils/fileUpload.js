/**
 * Utility for uploading deliverable files to backend server
 * Handles disk persistence on backend and returns lightweight static URLs
 */

export const uploadFileToServer = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64Data,
            fileType: file.type || 'application/octet-stream'
          })
        });

        if (response.ok) {
          const result = await response.json();
          resolve({
            name: result.name || file.name,
            size: result.size || `${(file.size / 1024).toFixed(1)} KB`,
            type: result.type || file.type || 'application/octet-stream',
            url: result.url,
            uploadedAt: result.uploadedAt || new Date().toISOString()
          });
        } else {
          console.warn('[Upload Warning] Server upload returned non-200, falling back safely');
          resolve({
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type || 'application/octet-stream',
            url: base64Data.length < 300000 ? base64Data : '',
            uploadedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('[Upload Warning] Upload request failed:', err.message);
        resolve({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          type: file.type || 'application/octet-stream',
          url: base64Data.length < 300000 ? base64Data : '',
          uploadedAt: new Date().toISOString()
        });
      }
    };
    reader.readAsDataURL(file);
  });
};

export const downloadFileAttachment = (file) => {
  if (!file || !file.url) {
    alert('No downloadable file link found for this task.');
    return;
  }
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name || 'deliverable-document';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
