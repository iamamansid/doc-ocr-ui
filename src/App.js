import React, { useState } from 'react';
import axios from 'axios';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/webpack';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';

// Ensure PDF.js worker is loaded correctly
GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showColdStartBanner, setShowColdStartBanner] = useState(true);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      setFileName('');
      setError('No file selected.');
      return;
    }

    if (
      !(
        selectedFile.type === 'image/jpeg' ||
        selectedFile.type === 'application/pdf'
      )
    ) {
      setFile(null);
      setFileName('');
      setError('Please upload a valid JPG or PDF file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileName('');
      setError('File size exceeds 5MB. Please upload a smaller file.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError(null);
    setOcrResult(null);
  };

  const convertPdfToJpg = async (pdfFile) => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], 'converted.jpg', { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    setOcrResult(null);

    try {
      let fileToUpload = file;

      if (file.type === 'application/pdf') {
        fileToUpload = await convertPdfToJpg(file);
      }

      const formData = new FormData();
      formData.append('document', fileToUpload);

      const response = await axios.post(
        'https://spring-ai-backend-production-0a75.up.railway.app/api/webapp/v0/getDocScanned',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.result) {
        setOcrResult(response.data.response);
        setShowColdStartBanner(false);
      } else {
        setError('Failed to process the document. Please retry once.');
      }
    } catch (err) {
      setError(
        'The request failed. This may occur during the first attempt due to server cold start. Please retry once.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header">
          Document OCR Scanner
        </div>

        <div className="card-body">

          {showColdStartBanner && (
            <div className="alert alert-info cold-start-banner">
              <strong>Note:</strong> The first API request may take longer or fail
              due to server cold start. If that happens, please retry once.
              <button
                className="close"
                onClick={() => setShowColdStartBanner(false)}
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="document">Upload Document (JPG or PDF)</label>
              <input
                type="file"
                id="document"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.pdf"
              />
              {fileName && <div className="file-info">Selected: {fileName}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Processing...
                </>
              ) : (
                'Scan Document'
              )}
            </button>
          </form>

          {error && (
            <div className="alert alert-danger mt-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {ocrResult && (
            <div className="ocr-results">
              <h2>OCR Results</h2>

              <div className="ocr-card">
                <strong>Caption</strong>
                <p>{ocrResult.captionResult}</p>
              </div>

              <div className="ocr-card">
                <strong>Confidence</strong>
                <p>{ocrResult.confidence}</p>
              </div>

              <div className="ocr-card">
                <strong>Extracted Text</strong>
                <pre className="ocr-text">{ocrResult.readResult}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
      <Chatbot />
      <Footer />
    </div>
  );
}

export default App;
