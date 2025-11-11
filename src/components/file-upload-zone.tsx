'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { processUploadedFiles } from '@/store/labeling-store';
import { useLabelingStore } from '@/store/labeling-store';
import { DataItem } from '@/types';

interface FileUploadZoneProps {
  className?: string;
  onFilesProcessed?: (items: DataItem[]) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  className,
  onFilesProcessed 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { setCurrentDataset, setIsProcessing } = useLabelingStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const processFiles = useCallback(async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      const items = await processUploadedFiles(uploadedFiles);
      
      const newDataset = {
        id: crypto.randomUUID(),
        name: `Dataset ${new Date().toLocaleDateString()}`,
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalItems: items.length,
        reviewedItems: 0,
        labels: [...new Set(items.flatMap(i => i.suggestedLabels || []))]
      };
      
      setCurrentDataset(newDataset);
      onFilesProcessed?.(items);
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, setCurrentDataset, onFilesProcessed, setIsProcessing]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragOver ? 'border-primary bg-primary/5' : 'border-border',
          'hover:border-primary hover:bg-primary/5 cursor-pointer'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
        <p className="text-muted-foreground mb-4">
          Supports images, text files, and audio files
        </p>
        <input
          type="file"
          multiple
          accept="image/*,text/*,audio/*,.txt,.csv,.json,.wav,.mp3,.m4a,.ogg"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Select Files
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({uploadedFiles.length})</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card border rounded-md"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={processFiles}
            className="w-full py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
          >
            Process Files
          </button>
        </div>
      )}
    </div>
  );
};