'use client';

import React, { useState } from 'react';
import { Download, Upload, FileText, Image, Music } from 'lucide-react';
import { Dataset } from '@/types';
import { useLabelingStore } from '@/store/labeling-store';
import { cn } from '@/lib/utils';

interface ExportPanelProps {
  dataset: Dataset;
  className?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ dataset, className }) => {
  const { exportDataset } = useLabelingStore();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const handleExport = () => {
    const data = exportDataset();
    
    if (exportFormat === 'json') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Simple CSV export
      const headers = ['id', 'name', 'type', 'suggestedLabels', 'confirmedLabels', 'confidence', 'status'];
      const rows = dataset.items.map(item => [
        item.id,
        item.name,
        item.type,
        (item.suggestedLabels || []).join(';'),
        (item.confirmedLabels || []).join(';'),
        item.confidence || '',
        item.status
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataset.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getCompletionStats = () => {
    const reviewed = dataset.items.filter(item => item.status === 'reviewed').length;
    const pending = dataset.items.filter(item => item.status === 'pending').length;
    const skipped = dataset.items.filter(item => item.status === 'skipped').length;
    
    return { reviewed, pending, skipped };
  };

  const stats = getCompletionStats();

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="font-semibold text-lg mb-4">Export Dataset</h3>
        <p className="text-sm text-muted-foreground">
          Download your labeled dataset in your preferred format.
        </p>
      </div>

      {/* Dataset Summary */}
      <div className="bg-card border rounded-lg p-6">
        <h4 className="font-medium mb-4">Dataset Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-xl font-bold">{dataset.totalItems}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reviewed</p>
            <p className="text-xl font-bold text-green-600">{stats.reviewed}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Skipped</p>
            <p className="text-xl font-bold text-gray-600">{stats.skipped}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">Unique Labels</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {dataset.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="bg-card border rounded-lg p-6">
        <h4 className="font-medium mb-4">Export Format</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="json"
              checked={exportFormat === 'json'}
              onChange={(e) => setExportFormat(e.target.value as 'json')}
              className="w-4 h-4 text-primary"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">JSON</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete dataset with all metadata and AI suggestions
              </p>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={(e) => setExportFormat(e.target.value as 'csv')}
              className="w-4 h-4 text-primary"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium">CSV</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tabular format for easy import into spreadsheets and analysis tools
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center justify-center space-x-2"
      >
        <Download className="w-5 h-5" />
        <span>Export Dataset</span>
      </button>
    </div>
  );
};