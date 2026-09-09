'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileAudio, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface AudioUploaderProps {
  onUploadSuccess: (callId: string) => void;
}

export function AudioUploader({ onUploadSuccess }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav'],
      'audio/mpeg': ['.mp3'],
      'audio/flac': ['.flac'],
      'audio/ogg': ['.ogg']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    // caller_id is optional but let's send a dummy or filename
    formData.append('caller_id', 'manual-upload');

    try {
      const response = await api.post('/api/analysis/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      toast.success('Audio uploaded successfully');
      // response.data should have call id, or analysis result directly depending on backend
      // Assuming it returns an AnalysisResult or Call. Wait, the backend returns AnalysisResult which has call_id.
      onUploadSuccess(response.data.call_id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
            isDragActive ? "border-foreground bg-surface-hover" : "border-border hover:border-border-hover hover:bg-surface-hover/50"
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <p className="text-lg font-medium text-text-primary mb-2">
            Drag & drop audio file here
          </p>
          <p className="text-sm text-text-secondary">
            or click to browse (WAV, MP3, FLac, OGG up to 50MB)
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-6 bg-surface">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-elevated rounded-lg">
                <FileAudio size={24} className="text-text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-text-secondary">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            {!isUploading && (
              <button 
                onClick={() => setFile(null)}
                className="text-text-secondary hover:text-text-primary hover:bg-surface-hover p-2 rounded-full transition-colors focus:outline-none"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {isUploading && (
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-secondary">Uploading and analyzing...</span>
                <span className="text-text-primary font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className="bg-foreground h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!isUploading && (
              <Button variant="ghost" onClick={() => setFile(null)}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
            >
              {isUploading ? 'Processing...' : 'Analyze Audio'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
