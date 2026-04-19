// ============================================================
// KEEP — useRequests Hook
//
// 컴포넌트는 이 hook만 사용합니다.
// store 또는 서비스에 대해 직접 알 필요가 없습니다.
// 실제 API 전환 시 hook 코드는 변경 없음 — service만 교체.
// ============================================================

import { useCallback, useEffect, useRef } from 'react';
import { useFittingStore } from '../store/useFittingStore';
import { requestService } from '../services';
import type { FittingStatus, CreateFittingRequestBody } from '../types/request';

/**
 * useRequests
 *
 * - requests: 전체 요청 목록 (Zustand subscribe로 실시간 반영)
 * - createRequest: 고객용 — 피팅 요청 생성 (POST)
 * - updateStatus:  직원용 — 상태 변경 (PATCH)
 */
export const useRequests = () => {
  const requests = useFittingStore(state => state.requests);

  const createRequest = useCallback(
    async (body: CreateFittingRequestBody) => {
      return requestService.createRequest(body);
    },
    []
  );

  const updateStatus = useCallback(
    async (requestId: string, status: FittingStatus) => {
      return requestService.updateStatus(requestId, status);
    },
    []
  );

  return { requests, createRequest, updateStatus };
};

/**
 * useAdminStats
 *
 * - 관리자 대시보드용 통계 (GET /admin/stats)
 * - requests가 바뀔 때마다 재계산 (실제 API에선 polling 또는 websocket으로 교체)
 */
export const useAdminStats = () => {
  const requests = useFittingStore(state => state.requests);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return stats;
};
