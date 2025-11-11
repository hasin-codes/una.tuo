'use client';

import React from 'react';
import { Check, X, Plus, Tag } from 'lucide-react';
import { DataItem } from '@/types';
import { cn } from '@/lib/utils';
import { useLabelingStore } from '@/store/labeling-store';

interface LabelingPanelProps {
  item: DataItem;
  className?: string;
}

export const LabelingPanel: React.FC<LabelingPanelProps> = ({ item, className }) => {
  const { 
    selectedLabels, 
    setSelectedLabels, 
    updateItem,
    currentDataset,
    currentItemIndex,
    setCurrentItemIndex
  } = useLabelingStore();

  const handleLabelToggle = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleAddCustomLabel = (label: string) => {
    if (label.trim() && !selectedLabels.includes(label.trim())) {
      setSelectedLabels([...selectedLabels, label.trim()]);
    }
  };

  const handleConfirmLabels = () => {
    updateItem(item.id, {
      confirmedLabels: selectedLabels,
      status: 'reviewed'
    });
    
    // Move to next item
    if (currentDataset && currentItemIndex < currentDataset.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const handleSkip = () => {
    updateItem(item.id, { status: 'skipped' });
    
    // Move to next item
    if (currentDataset && currentItemIndex < currentDataset.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    }
  };

  const allLabels = currentDataset?.labels || [];
  const unusedLabels = allLabels.filter(label => !selectedLabels.includes(label));

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Labeling
        </h3>
        
        {/* AI Suggested Labels */}
        {item.suggestedLabels && item.suggestedLabels.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              AI Suggested Labels
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.suggestedLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => handleLabelToggle(label)}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium transition-all',
                    selectedLabels.includes(label)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {label}
                  {selectedLabels.includes(label) && (
                    <Check className="w-3 h-3 ml-1 inline" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Labels */}
        {selectedLabels.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Selected Labels ({selectedLabels.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedLabels.map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center"
                >
                  {label}
                  <button
                    onClick={() => handleLabelToggle(label)}
                    className="ml-2 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Labels */}
        {unusedLabels.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Available Labels
            </h4>
            <div className="flex flex-wrap gap-2">
              {unusedLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => handleLabelToggle(label)}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm hover:bg-muted/80 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1 inline" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Label Input */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Add Custom Label
          </h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const label = formData.get('customLabel') as string;
              handleAddCustomLabel(label);
              e.currentTarget.reset();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="customLabel"
              placeholder="Enter custom label..."
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm font-medium"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          onClick={handleSkip}
          className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-md hover:bg-muted transition-colors font-medium"
        >
          Skip
        </button>
        <button
          onClick={handleConfirmLabels}
          disabled={selectedLabels.length === 0}
          className={cn(
            'flex-1 px-4 py-2 rounded-md transition-colors font-medium',
            selectedLabels.length === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          Confirm Labels
        </button>
      </div>
    </div>
  );
};