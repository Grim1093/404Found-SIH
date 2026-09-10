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
      console.log("[AudioUploader] Step 1: File dropped/selected:", acceptedFiles[0].name);
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
    if (!file) {
      console.log("[AudioUploader] Upload aborted: No file selected.");
      return;
    }

    console.log("[AudioUploader] Step 2: Preparing upload for:", file.name);
    setIsUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    console.log("[AudioUploader] Step 3: Appending 'audio' to FormData.");
    formData.append('audio', file);
    
    console.log("[AudioUploader] Step 4: Appending dummy 'caller_id'.");
    formData.append('caller_id', 'manual-upload');

    try {
      console.log("[AudioUploader] Step 5: Sending POST request to backend...");
      
      // CRITICAL FIX: Removed the manual headers block entirely.
      // Axios/Fetch will now automatically detect the FormData and set the correct 
      // Content-Type with the necessary auto-generated boundary string.
      const response = await api.post('/api/analysis/upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
            console.log(`[AudioUploader] Upload progress: ${percentCompleted}%`);
          }
        },
      });

      console.log("[AudioUploader] Step 6: Upload successful, response:", response.data);
      toast.success('Audio uploaded successfully');
      
      console.log("[AudioUploader] Step 7: Triggering onUploadSuccess with call_id:", response.data.call_id);
      onUploadSuccess(response.data.call_id);
      
    } catch (err: any) {
      console.error("[AudioUploader] Upload Failed! Error details:", err);
      
      let errorMessage = 'Upload failed due to an unknown error.';
      const detail = err.response?.data?.detail;
      
      if (Array.isArray(detail)) {
        errorMessage = detail.map((d: any) => `${d.loc.join('.')} - ${d.msg}`).join(', ');
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      console.log("[AudioUploader] Step 6 (Failure): Extracted error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log("[AudioUploader] Step 8: Upload process finished, resetting states.");
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
                onClick={() => {
                  console.log("[AudioUploader] File cleared by user.");
                  setFile(null);
                }}
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
              <Button variant="ghost" onClick={() => {
                console.log("[AudioUploader] Upload canceled by user.");
                setFile(null);
              }}>
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