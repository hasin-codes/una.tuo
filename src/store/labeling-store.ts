import { create } from 'zustand';
import { DataItem, Dataset, Cluster, ViewMode, LabelingState } from '@/types';

interface LabelingStore extends LabelingState {
  // Actions
  setCurrentView: (view: ViewMode) => void;
  setCurrentDataset: (dataset: Dataset | null) => void;
  addItem: (item: DataItem) => void;
  updateItem: (id: string, updates: Partial<DataItem>) => void;
  removeItem: (id: string) => void;
  setCurrentItemIndex: (index: number) => void;
  setIsProcessing: (processing: boolean) => void;
  setSelectedLabels: (labels: string[]) => void;
  addSelectedLabel: (label: string) => void;
  removeSelectedLabel: (label: string) => void;
  generateClusters: () => void;
  setFilterLabels: (labels: string[]) => void;
  exportDataset: () => string;
  reset: () => void;
}

const generateMockLabels = (type: DataItem['type']): string[] => {
  const labelSets = {
    image: ['cat', 'dog', 'person', 'car', 'building', 'nature', 'food', 'object'],
    text: ['positive', 'negative', 'neutral', 'question', 'statement', 'urgent', 'informal'],
    audio: ['speech', 'music', 'noise', 'silence', 'alarm', 'voice', 'instrument']
  };
  
  const labels = labelSets[type];
  const numLabels = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...labels].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, numLabels);
};

const generateMockClusters = (items: DataItem[]): Cluster[] => {
  const clusterColors = ['#662222', '#842A3B', '#A3485A', '#F5DAA7'];
  const numClusters = Math.min(4, Math.max(2, Math.floor(items.length / 5)));
  const clusters: Cluster[] = [];
  
  for (let i = 0; i < numClusters; i++) {
    const clusterItems = items.filter((_, index) => index % numClusters === i);
    const allLabels = clusterItems.flatMap(item => item.suggestedLabels || []);
    const commonLabels = [...new Set(allLabels)].slice(0, 3);
    
    clusters.push({
      id: i,
      name: `Cluster ${i + 1}`,
      items: clusterItems,
      commonLabels,
      color: clusterColors[i % clusterColors.length]
    });
  }
  
  return clusters;
};

export const useLabelingStore = create<LabelingStore>((set, get) => ({
  // Initial state
  currentDataset: null,
  currentView: 'upload',
  currentItemIndex: 0,
  isProcessing: false,
  selectedLabels: [],
  clusters: [],
  filterLabels: [],

  // Actions
  setCurrentView: (view) => set({ currentView: view }),
  
  setCurrentDataset: (dataset) => set({ 
    currentDataset: dataset,
    currentItemIndex: 0,
    selectedLabels: [],
    clusters: dataset ? generateMockClusters(dataset.items) : []
  }),
  
  addItem: (item) => set((state) => {
    if (!state.currentDataset) return state;
    
    const updatedItems = [...state.currentDataset.items, item];
    const updatedDataset: Dataset = {
      ...state.currentDataset,
      items: updatedItems,
      totalItems: updatedItems.length,
      updatedAt: new Date(),
      labels: [...new Set(updatedItems.flatMap(i => [...(i.suggestedLabels || []), ...(i.confirmedLabels || [])]))]
    };
    
    return {
      currentDataset: updatedDataset,
      clusters: generateMockClusters(updatedItems)
    };
  }),
  
  updateItem: (id, updates) => set((state) => {
    if (!state.currentDataset) return state;
    
    const updatedItems = state.currentDataset.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    
    const reviewedItems = updatedItems.filter(item => item.status === 'reviewed').length;
    const labels = [...new Set(updatedItems.flatMap(i => [...(i.suggestedLabels || []), ...(i.confirmedLabels || [])]))];
    
    const updatedDataset: Dataset = {
      ...state.currentDataset,
      items: updatedItems,
      reviewedItems,
      labels,
      updatedAt: new Date()
    };
    
    return {
      currentDataset: updatedDataset,
      clusters: generateMockClusters(updatedItems)
    };
  }),
  
  removeItem: (id) => set((state) => {
    if (!state.currentDataset) return state;
    
    const updatedItems = state.currentDataset.items.filter(item => item.id !== id);
    const updatedDataset: Dataset = {
      ...state.currentDataset,
      items: updatedItems,
      totalItems: updatedItems.length,
      updatedAt: new Date()
    };
    
    return {
      currentDataset: updatedDataset,
      currentItemIndex: Math.min(state.currentItemIndex, updatedItems.length - 1),
      clusters: generateMockClusters(updatedItems)
    };
  }),
  
  setCurrentItemIndex: (index) => set({ currentItemIndex: index }),
  
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  setSelectedLabels: (labels) => set({ selectedLabels: labels }),
  
  addSelectedLabel: (label) => set((state) => ({
    selectedLabels: [...state.selectedLabels, label]
  })),
  
  removeSelectedLabel: (label) => set((state) => ({
    selectedLabels: state.selectedLabels.filter(l => l !== label)
  })),
  
  generateClusters: () => set((state) => ({
    clusters: state.currentDataset ? generateMockClusters(state.currentDataset.items) : []
  })),
  
  setFilterLabels: (labels) => set({ filterLabels: labels }),
  
  exportDataset: () => {
    const { currentDataset } = get();
    if (!currentDataset) return '';
    
    const exportData = {
      dataset: {
        name: currentDataset.name,
        totalItems: currentDataset.totalItems,
        reviewedItems: currentDataset.reviewedItems,
        createdAt: currentDataset.createdAt,
        labels: currentDataset.labels
      },
      items: currentDataset.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        suggestedLabels: item.suggestedLabels,
        confirmedLabels: item.confirmedLabels,
        confidence: item.confidence,
        status: item.status
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  },
  
  reset: () => set({
    currentDataset: null,
    currentView: 'upload',
    currentItemIndex: 0,
    isProcessing: false,
    selectedLabels: [],
    clusters: [],
    filterLabels: []
  })
}));

// Helper function to process uploaded files
export const processUploadedFiles = async (files: File[]): Promise<DataItem[]> => {
  const items: DataItem[] = [];
  
  for (const file of files) {
    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('text/') || file.type.includes('text') ? 'text' :
                 file.type.startsWith('audio/') ? 'audio' : 'text';
    
    let content: string | File = file;
    
    if (type === 'text') {
      content = await file.text();
    }
    
    const suggestedLabels = generateMockLabels(type);
    const confidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
    
    items.push({
      id: crypto.randomUUID(),
      name: file.name,
      type,
      content,
      size: file.size,
      suggestedLabels,
      confirmedLabels: [],
      confidence,
      status: 'pending'
    });
  }
  
  return items;
};