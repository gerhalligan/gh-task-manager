import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import bytes from 'bytes';
import { FileAttachment } from '../types/task';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface FileViewerProps {
  file: FileAttachment;
  onClose: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isPDF = file.type === 'application/pdf';
  const isImage = file.type.startsWith('image/');

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">{file.name}</h3>
            <p className="text-sm text-gray-500">
              {bytes(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFullscreen}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <a
              href={file.url}
              download={file.name}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <TransformWrapper>
            <TransformComponent>
              {isPDF ? (
                <div>
                  <Document
                    file={file.url}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    <Page pageNumber={pageNumber} />
                  </Document>
                  {numPages && numPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={() => setPageNumber(page => Math.max(1, page - 1))}
                        disabled={pageNumber <= 1}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1">
                        Page {pageNumber} of {numPages}
                      </span>
                      <button
                        onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
                        disabled={pageNumber >= numPages}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : isImage ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Preview not available</p>
                </div>
              )}
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
}