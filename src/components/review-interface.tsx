'use client';

import React, { useEffect } from 'react';
import { useLabelingStore } from '@/store/labeling-store';
import { DatasetStats } from '@/components/dataset-stats';
import { DataItemViewer } from '@/components/data-item-viewer';
import { LabelingPanel } from '@/components/labeling-panel';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewInterfaceProps {
  className?: string;
}

export const ReviewInterface: React.FC<ReviewInterfaceProps> = ({ className }) => {
  const { 
    currentDataset, 
    currentItemIndex, 
    setCurrentItemIndex,
    selectedLabels,
    setSelectedLabels
  } = useLabelingStore();

  useEffect(() => {
    if (currentDataset && currentDataset.items[currentItemIndex]) {
      const currentItem = currentDataset.items[currentItemIndex];
      setSelectedLabels(currentItem.confirmedLabels || []);
    }
  }, [currentItemIndex, currentDataset, setSelectedLabels]);

  if (!currentDataset || currentDataset.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No items to review</p>
      </div>
    );
  }

  const currentItem = currentDataset.items[currentItemIndex];
  const progress = Math.round(((currentItemIndex + 1) / currentDataset.items.length) * 100);

  const goToPrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(currentItemIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentItemIndex < currentDataset.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const resetToStart = () => {
    setCurrentItemIndex(0);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Header */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-lg">
              Item {currentItemIndex + 1} of {currentDataset.items.length}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentDataset.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{progress}%</div>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>
        
        <div className="w-full bg-border rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              disabled={currentItemIndex === 0}
              className={cn(
                'p-2 rounded-md transition-colors',
                currentItemIndex === 0
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              Previous
            </span>
          </div>

          <button
            onClick={resetToStart}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Next
            </span>
            <button
              onClick={goToNext}
              disabled={currentItemIndex === currentDataset.items.length - 1}
              className={cn(
                'p-2 rounded-md transition-colors',
                currentItemIndex === currentDataset.items.length - 1
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Stats */}
      <DatasetStats dataset={currentDataset} />

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Item Viewer */}
        <div>
          <DataItemViewer item={currentItem} />
        </div>

        {/* Labeling Panel */}
        <div>
          <LabelingPanel item={currentItem} />
        </div>
      </div>
    </div>
  );
};