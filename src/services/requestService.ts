// ============================================================
// KEEP — Request Service Interface
// 이 인터페이스를 구현하는 클래스/모듈만 교체하면
// Mock → 실제 API로 전환됩니다.
// ============================================================

import type {
  FittingRequest,
  FittingStatus,
  CreateFittingRequestBody,
  GetRequestsResponse,
  AdminStats,
} from '../types/request';

/**
 * IRequestService
 *
 * 구현체:
 *  - MockRequestService (src/services/mockRequestService.ts) — 현재 사용
 *  - ApiRequestService  (src/services/apiRequestService.ts)  — 백엔드 연동 시 교체
 */
export interface IRequestService {
  /**
   * [POST /requests] 피팅 요청 생성
   */
  createRequest(body: CreateFittingRequestBody): Promise<FittingRequest>;

  /**
   * [GET /requests] 전체 요청 목록 조회
   */
  getRequests(): Promise<GetRequestsResponse>;

  /**
   * [PATCH /requests/:id/status] 요청 상태 변경
   */
  updateStatus(requestId: string, status: FittingStatus): Promise<FittingRequest>;

  /**
   * [GET /admin/stats] 관리자 통계 조회
   */
  getAdminStats(): Promise<AdminStats>;
}
