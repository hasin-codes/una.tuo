export interface DataItem {
  id: string;
  name: string;
  type: 'image' | 'text' | 'audio';
  content: string | File;
  size?: number;
  suggestedLabels?: string[];
  confirmedLabels?: string[];
  confidence?: number;
  clusterId?: number;
  status: 'pending' | 'reviewed' | 'skipped';
}

export interface Dataset {
  id: string;
  name: string;
  items: DataItem[];
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  reviewedItems: number;
  labels: string[];
}

export interface Cluster {
  id: number;
  name: string;
  items: DataItem[];
  commonLabels: string[];
  color: string;
}

export type ViewMode = 'upload' | 'review' | 'clusters' | 'export';

export interface LabelingState {
  currentDataset: Dataset | null;
  currentView: ViewMode;
  currentItemIndex: number;
  isProcessing: boolean;
  selectedLabels: string[];
  clusters: Cluster[];
  filterLabels: string[];
}