import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FittingRequest, FittingStatus } from '../types';

interface FittingStore {
  requests: FittingRequest[];
  addRequest: (request: Omit<FittingRequest, 'requestTime'>) => void;
  updateRequestStatus: (requestId: string, status: FittingStatus) => void;
  clearRequests: () => void;
}

export const useFittingStore = create<FittingStore>()(
  persist(
    (set) => ({
      requests: [],
      addRequest: (requestData) => set((state) => {
        const newRequest: FittingRequest = {
          ...requestData,
          requestTime: Date.now(),
        };
        return { requests: [newRequest, ...state.requests] };
      }),
      updateRequestStatus: (requestId, status) => set((state) => ({
        requests: state.requests.map((req) => 
          req.requestId === requestId 
            ? { ...req, status } 
            : req
        )
      })),
      clearRequests: () => set({ requests: [] }),
    }),
    {
      name: 'keep-fitting-storage-v2', // unique name for localStorage key
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'keep-fitting-storage-v2') {
      useFittingStore.persist.rehydrate();
    }
  });
}
