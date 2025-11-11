'use client';

import React from 'react';
import { useLabelingStore } from '@/store/labeling-store';
import { Navigation } from '@/components/navigation';
import { FileUploadZone } from '@/components/file-upload-zone';
import { ReviewInterface } from '@/components/review-interface';
import { ClusterView } from '@/components/cluster-view';
import { ExportPanel } from '@/components/export-panel';
import { ViewMode } from '@/types';

export default function Home() {
  const { currentView, currentDataset, setCurrentView, setCurrentItemIndex } = useLabelingStore();

  const handleFilesProcessed = () => {
    setCurrentView('review');
  };

  const handleClusterSelect = (cluster: any) => {
    // When a cluster is selected, switch to review view and show first item from cluster
    if (cluster.items.length > 0) {
      const firstItemIndex = currentDataset?.items.findIndex(item => item.id === cluster.items[0].id);
      if (firstItemIndex !== undefined && firstItemIndex >= 0) {
        setCurrentItemIndex(firstItemIndex);
        setCurrentView('review');
      }
    }
  };

  const handleItemSelect = (item: any) => {
    // Find and navigate to selected item
    const itemIndex = currentDataset?.items.findIndex(i => i.id === item.id);
    if (itemIndex !== undefined && itemIndex >= 0) {
      setCurrentItemIndex(itemIndex);
      setCurrentView('review');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Navigation */}
          <Navigation />

          {/* Main Content Area */}
          <div className="bg-card border rounded-lg p-6 min-h-[600px]">
            {currentView === 'upload' && (
              <FileUploadZone onFilesProcessed={handleFilesProcessed} />
            )}

            {currentView === 'review' && (
              <ReviewInterface />
            )}

            {currentView === 'clusters' && currentDataset && (
              <ClusterView
                clusters={useLabelingStore.getState().clusters}
                onClusterSelect={handleClusterSelect}
                onItemSelect={handleItemSelect}
              />
            )}

            {currentView === 'export' && currentDataset && (
              <ExportPanel dataset={currentDataset} />
            )}

            {/* Empty states */}
            {currentView !== 'upload' && !currentDataset && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Dataset Loaded</h3>
                <p className="text-muted-foreground mb-4">
                  Upload some files to get started with labeling
                </p>
                <button
                  onClick={() => setCurrentView('upload')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Upload Files
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}