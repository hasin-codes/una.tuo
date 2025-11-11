'use client';

import React from 'react';
import { Cluster, DataItem } from '@/types';
import { cn } from '@/lib/utils';

interface ClusterViewProps {
  clusters: Cluster[];
  onClusterSelect?: (cluster: Cluster) => void;
  onItemSelect?: (item: DataItem) => void;
  className?: string;
}

export const ClusterView: React.FC<ClusterViewProps> = ({ 
  clusters, 
  onClusterSelect,
  onItemSelect,
  className 
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="font-semibold text-lg mb-4">AI-Generated Clusters</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Items are automatically grouped by similarity. Click on any cluster to explore.
        </p>
      </div>

      <div className="grid gap-6">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClusterSelect?.(cluster)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">{cluster.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {cluster.items.length} items
                </p>
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: cluster.color }}
              />
            </div>

            {/* Common Labels */}
            {cluster.commonLabels.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-muted-foreground mb-2">
                  Common Labels
                </h5>
                <div className="flex flex-wrap gap-2">
                  {cluster.commonLabels.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Items */}
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">
                Sample Items
              </h5>
              <div className="space-y-2">
                {cluster.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemSelect?.(item);
                    }}
                  >
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.type}
                    </span>
                  </div>
                ))}
                {cluster.items.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{cluster.items.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};