import React, { useState } from 'react';
import bytes from 'bytes';
import { FileAttachment } from '../types/task';
import { FileViewer } from './FileViewer';

interface FileAttachmentsProps {
  attachments: FileAttachment[];
  onUpload: (files: File[]) => void;
  onDelete: (fileId: string) => void;
}

export function FileAttachments({ attachments, onUpload, onDelete }: FileAttachmentsProps) {
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
      e.target.value = ''; // Reset input
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type === 'application/pdf') {
      return '📄';
    } else {
      return '📎';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-medium text-gray-700">Attachments</label>
        <label className="cursor-pointer px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded">
          Upload Files
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />
        </label>
      </div>

      <div className="space-y-2">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
          >
            <div
              className="flex items-center flex-1 cursor-pointer"
              onClick={() => setSelectedFile(file)}
            >
              <span className="text-2xl mr-2">{getFileIcon(file.type)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {bytes(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(file.id)}
              className="ml-4 text-sm text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No attachments yet
          </p>
        )}
      </div>

      {selectedFile && (
        <FileViewer
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}