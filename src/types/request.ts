// ============================================================
// KEEP — 공통 데이터 타입 정의 (Request Layer)
// 나중에 실제 API와 연동할 때 이 파일의 타입만 맞추면 됩니다.
// ============================================================

export type FittingStatus = 'pending' | 'assigned' | 'completed';

/** NFC 태깅 시 선택된 단일 상품 */
export interface TaggedProduct {
  productId: string;
  productName: string;
  color: string;
  size: string;
}

/** 피팅 요청 전체 객체 (GET/POST 공통) */
export interface FittingRequest {
  requestId: string;
  products: TaggedProduct[];
  fittingRoomId: string;
  status: FittingStatus;
  requestTime: number;   // Unix timestamp (ms) — API: ISO 8601 string으로 변환 필요
  sessionId: string;
}

// --------------------------------------------------------------
// API boundary 타입 — 실제 API 연동 시 이 타입들을 사용합니다.
// --------------------------------------------------------------

/** POST /requests — 피팅 요청 생성 바디 */
export type CreateFittingRequestBody = Omit<FittingRequest, 'requestId' | 'requestTime'>;

/** PATCH /requests/:id/status — 상태 변경 바디 */
export interface UpdateStatusBody {
  requestId: string;
  status: FittingStatus;
}

/** GET /requests — 목록 응답 */
export interface GetRequestsResponse {
  requests: FittingRequest[];
}

/** GET /admin/stats — 관리자 통계 응답 */
export interface AdminStats {
  total: number;
  pending: number;
  assigned: number;
  completed: number;
}
