import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FittingRequest, FittingStatus } from '../types';

interface FittingStore {
  requests: FittingRequest[];
  addRequest: (request: Omit<FittingRequest, 'createdAt' | 'updatedAt'>) => void;
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
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { requests: [newRequest, ...state.requests] };
      }),
      updateRequestStatus: (requestId, status) => set((state) => ({
        requests: state.requests.map((req) => 
          req.requestId === requestId 
            ? { ...req, status, updatedAt: Date.now() } 
            : req
        )
      })),
      clearRequests: () => set({ requests: [] }),
    }),
    {
      name: 'keep-fitting-storage', // unique name for localStorage key
    }
  )
);
