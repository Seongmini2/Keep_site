// ============================================================
// KEEP — useRequests Hook
//
// 컴포넌트는 이 hook만 사용합니다.
// store 또는 서비스에 대해 직접 알 필요가 없습니다.
// 실제 API 전환 시 hook 코드는 변경 없음 — service만 교체.
// ============================================================

import { useCallback, useState } from 'react';
import { useFittingStore } from '../store/useFittingStore';
import { requestService } from '../services';
import type { FittingStatus, CreateFittingRequestBody } from '../types/request';

/**
 * useRequests
 *
 * - requests:      전체 요청 목록 (Zustand subscribe로 실시간 반영)
 * - loading:       API 호출 중 여부 (UI 로딩 처리용)
 * - error:         API 실패 시 에러 메시지 (향후 UI 에러 처리용)
 * - createRequest: 고객용 — 피팅 요청 생성 (POST)
 * - updateStatus:  직원용 — 상태 변경 (PATCH)
 */
export const useRequests = () => {
  const requests = useFittingStore(state => state.requests);

  // ----------------------------------------------------------
  // 로딩 / 에러 상태 — API 호출 대응 준비
  // 현재: mockRequestService 사용 중이므로 loading은 짧게 토글됨
  // 실제 API: fetch 응답 대기 중 loading=true, 완료 후 false
  // ----------------------------------------------------------
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(
    async (body: CreateFittingRequestBody) => {
      setLoading(true);
      setError(null);
      try {
        return await requestService.createRequest(body);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'createRequest 실패';
        setError(message);
        console.error('[useRequests] createRequest 에러:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (requestId: string, status: FittingStatus) => {
      setLoading(true);
      setError(null);
      try {
        return await requestService.updateStatus(requestId, status);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'updateStatus 실패';
        setError(message);
        console.error('[useRequests] updateStatus 에러:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { requests, loading, error, createRequest, updateStatus };
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
