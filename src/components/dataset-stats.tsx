'use client';

import React from 'react';
import { BarChart3, Users, Tag, CheckCircle } from 'lucide-react';
import { Dataset } from '@/types';
import { cn } from '@/lib/utils';

interface DatasetStatsProps {
  dataset: Dataset;
  className?: string;
}

export const DatasetStats: React.FC<DatasetStatsProps> = ({ dataset, className }) => {
  const completionRate = dataset.totalItems > 0 
    ? Math.round((dataset.reviewedItems / dataset.totalItems) * 100)
    : 0;

  const stats = [
    {
      label: 'Total Items',
      value: dataset.totalItems,
      icon: BarChart3,
      color: 'text-primary'
    },
    {
      label: 'Reviewed',
      value: dataset.reviewedItems,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Labels',
      value: dataset.labels.length,
      icon: Tag,
      color: 'text-secondary'
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: Users,
      color: 'text-accent'
    }
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <stat.icon className={cn('w-4 h-4', stat.color)} />
          </div>
          <div className="text-2xl font-bold">{stat.value}</div>
        </div>
      ))}
      
      {/* Progress Bar */}
      <div className="col-span-2 md:col-span-4 bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {dataset.reviewedItems} / {dataset.totalItems} items
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};