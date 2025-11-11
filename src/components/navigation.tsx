'use client';

import React from 'react';
import { Upload, BarChart3, Layers, Download, Plus, RotateCcw } from 'lucide-react';
import { useLabelingStore } from '@/store/labeling-store';
import { ViewMode } from '@/types';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const { currentView, setCurrentView, currentDataset, reset } = useLabelingStore();

  const navigationItems = [
    {
      id: 'upload' as ViewMode,
      label: 'Upload',
      icon: Upload,
      description: 'Add new data files'
    },
    {
      id: 'review' as ViewMode,
      label: 'Review',
      icon: BarChart3,
      description: 'Label and review items',
      disabled: !currentDataset || currentDataset.items.length === 0
    },
    {
      id: 'clusters' as ViewMode,
      label: 'Clusters',
      icon: Layers,
      description: 'Explore AI clusters',
      disabled: !currentDataset || currentDataset.items.length === 0
    },
    {
      id: 'export' as ViewMode,
      label: 'Export',
      icon: Download,
      description: 'Download dataset',
      disabled: !currentDataset || currentDataset.items.length === 0
    }
  ];

  return (
    <div className={cn('bg-card border rounded-lg p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Small Data AI Labeler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick, accurate labeling for small datasets
          </p>
        </div>
        
        {currentDataset && (
          <button
            onClick={reset}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Dataset</span>
          </button>
        )}
      </div>

      <nav className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setCurrentView(item.id)}
              disabled={isDisabled}
              className={cn(
                'flex flex-col items-center p-4 rounded-lg border transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : isDisabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'hover:bg-muted hover:border-primary text-foreground'
              )}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {currentDataset && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">Current Dataset</p>
              <p className="text-muted-foreground">{currentDataset.name}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{currentDataset.totalItems} items</p>
              <p className="text-muted-foreground">
                {currentDataset.reviewedItems} reviewed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};