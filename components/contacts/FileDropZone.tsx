import React, { useCallback, useState } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelect,
  accept = '.csv,.vcf,.vcard',
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file type
    const validExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!validExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please use ${accept}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div
            className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center ${
              isDragging ? 'bg-blue-100' : 'bg-white'
            }`}
          >
            {isDragging ? (
              <Upload className="w-7 h-7 text-blue-500" />
            ) : (
              <File className="w-7 h-7 text-slate-400" />
            )}
          </div>

          <div>
            <p className="font-bold text-slate-700">
              {isDragging ? 'Drop file here' : 'Drag & drop or tap to select'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              CSV or vCard (.vcf) files
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-slate-500 uppercase">How to export contacts</p>
        <ul className="text-xs text-slate-500 space-y-1">
          <li><span className="font-medium">iPhone:</span> Settings → Contacts → Export → vCard</li>
          <li><span className="font-medium">Android:</span> Contacts → Menu → Export to .vcf</li>
          <li><span className="font-medium">Google:</span> contacts.google.com → Export → CSV</li>
        </ul>
      </div>
    </div>
  );
};

export default FileDropZone;
