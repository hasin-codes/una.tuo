'use client';

import React from 'react';
import { DataItem } from '@/types';
import { cn, formatFileSize } from '@/lib/utils';

interface DataItemViewerProps {
  item: DataItem;
  className?: string;
}

export const DataItemViewer: React.FC<DataItemViewerProps> = ({ item, className }) => {
  const renderContent = () => {
    switch (item.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-muted rounded-lg p-4">
            {typeof item.content === 'string' ? (
              <img
                src={item.content}
                alt={item.name}
                className="max-w-full max-h-96 object-contain rounded"
              />
            ) : (
              <img
                src={URL.createObjectURL(item.content)}
                alt={item.name}
                className="max-w-full max-h-96 object-contain rounded"
                onLoad={() => {
                  if (typeof item.content !== 'string') {
                    URL.revokeObjectURL(URL.createObjectURL(item.content));
                  }
                }}
              />
            )}
          </div>
        );
      
      case 'text':
        return (
          <div className="bg-card border rounded-lg p-4">
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {typeof item.content === 'string' ? item.content : 'Text content'}
              </pre>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-card border rounded-lg p-6">
            <audio
              controls
              className="w-full"
              src={typeof item.content === 'string' ? item.content : URL.createObjectURL(item.content)}
            />
          </div>
        );
      
      default:
        return (
          <div className="bg-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Unsupported file type</p>
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <p className="text-sm text-muted-foreground">
            {item.type} {item.size && `• ${formatFileSize(item.size)}`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-2 py-1 text-xs rounded-full font-medium',
            item.status === 'reviewed' && 'bg-green-100 text-green-800',
            item.status === 'pending' && 'bg-yellow-100 text-yellow-800',
            item.status === 'skipped' && 'bg-gray-100 text-gray-800'
          )}>
            {item.status}
          </span>
        </div>
      </div>
      
      {renderContent()}
      
      {item.confidence && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">AI Confidence:</span>
          <div className="flex-1 bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${item.confidence * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium">{Math.round(item.confidence * 100)}%</span>
        </div>
      )}
    </div>
  );
};