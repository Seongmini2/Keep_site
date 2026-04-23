// ============================================================
// KEEP — API Request Service (IRequestService 구현체)
//
// 현재: mock 응답을 반환하는 형태로 구현됨 (fetch 주석 처리)
// 교체: BASE_URL 변경 + fetch 주석 해제 → 실제 API 연동 완료
//
// 전환 방법:
//   1. BASE_URL 을 실제 서버 주소로 변경
//   2. 각 함수에서 "실제 fetch" 블록 주석 해제
//   3. "mock 응답" 블록 주석 처리 또는 제거
//   4. src/services/index.ts 에서 import 대상 변경
// ============================================================

import type { IRequestService } from './requestService';
import type {
  FittingRequest,
  FittingStatus,
  CreateFittingRequestBody,
  GetRequestsResponse,
  AdminStats,
} from '../types/request';

// ------------------------------------------------------------
// BASE_URL — 백엔드 서버 주소
// 실제 연동 시: 'https://api.keep-service.com' 등으로 교체
// ------------------------------------------------------------
const BASE_URL = 'https://api.keep-service.com'; // TODO: 실제 서버 주소로 교체

// ============================================================
// 내부 API 응답 타입 (백엔드 응답 구조가 다를 경우를 대비)
// 실제 API 명세에 맞게 조정하세요.
// ============================================================

/** 백엔드 GET /requests 단일 항목 응답 구조 (예시) */
interface ApiRequestItem {
  request_id: string;          // snake_case → camelCase 변환 필요
  products: {
    product_id: string;
    product_name: string;
    color: string;
    size: string;
  }[];
  fitting_room_id: string;
  status: FittingStatus;
  request_time: string;        // ISO 8601 → Unix timestamp 변환 필요
  session_id: string;
}

/** 백엔드 POST /requests 바디 구조 (예시) */
interface ApiCreateRequestBody {
  products: {
    product_id: string;
    product_name: string;
    color: string;
    size: string;
  }[];
  fitting_room_id: string;
  status: FittingStatus;
  session_id: string;
}

// ============================================================
// 데이터 매핑 함수 — API ↔ 프론트 타입 변환
// ============================================================

/**
 * mapApiResponseToRequest
 * 백엔드 응답(snake_case) → 프론트 FittingRequest(camelCase) 변환
 */
function mapApiResponseToRequest(apiItem: ApiRequestItem): FittingRequest {
  return {
    requestId: apiItem.request_id,
    products: apiItem.products.map(p => ({
      productId: p.product_id,
      productName: p.product_name,
      color: p.color,
      size: p.size,
    })),
    fittingRoomId: apiItem.fitting_room_id,
    status: apiItem.status,
    requestTime: new Date(apiItem.request_time).getTime(), // ISO 8601 → ms
    sessionId: apiItem.session_id,
  };
}

/**
 * mapRequestToApiBody
 * 프론트 CreateFittingRequestBody → 백엔드 POST 바디(snake_case) 변환
 */
function mapRequestToApiBody(body: CreateFittingRequestBody): ApiCreateRequestBody {
  return {
    products: body.products.map(p => ({
      product_id: p.productId,
      product_name: p.productName,
      color: p.color,
      size: p.size,
    })),
    fitting_room_id: body.fittingRoomId,
    status: body.status,
    session_id: body.sessionId,
  };
}

// ============================================================
// Mock 데이터 — 실제 API 연동 전까지 사용하는 인메모리 저장소
// ============================================================

let mockStore: FittingRequest[] = [];

/** mock 피팅룸 배정 (1~4 랜덤) */
const assignFittingRoom = (): string =>
  String(Math.floor(Math.random() * 4) + 1);

// ============================================================
// API Request Service 구현체
// ============================================================

export const apiRequestService: IRequestService = {

  // ----------------------------------------------------------
  // [POST /requests]  피팅 요청 생성
  // ----------------------------------------------------------
  async createRequest(body: CreateFittingRequestBody): Promise<FittingRequest> {
    // ✅ [테스트용 로그] API 호출 payload 확인
    console.log('[apiRequestService] createRequest payload:', body);
    console.log('[apiRequestService] mapped API body:', mapRequestToApiBody(body));

    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapRequestToApiBody(body)),
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] createRequest failed: ${response.status} ${response.statusText}`);
      }

      const apiData: ApiRequestItem = await response.json();
      const result = mapApiResponseToRequest(apiData);
      console.log('[apiRequestService] createRequest response:', result);
      return result;
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(300);

      const newRequest: FittingRequest = {
        ...body,
        requestId: `req-${Date.now()}`,
        fittingRoomId: body.fittingRoomId || assignFittingRoom(),
        requestTime: Date.now(),
      };
      mockStore.push(newRequest);

      console.log('[apiRequestService] createRequest mock response:', newRequest);
      return newRequest;
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] createRequest 에러:', error);
      // 향후 UI 에러 처리: throw error 또는 에러 상태 관리 연결
      throw error;
    }
  },

  // ----------------------------------------------------------
  // [GET /requests]  전체 요청 목록
  // ----------------------------------------------------------
  async getRequests(): Promise<GetRequestsResponse> {
    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/requests`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] getRequests failed: ${response.status} ${response.statusText}`);
      }

      const apiData: { requests: ApiRequestItem[] } = await response.json();
      const requests = apiData.requests.map(mapApiResponseToRequest);
      console.log('[apiRequestService] getRequests response:', requests);
      return { requests };
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(200);

      console.log('[apiRequestService] getRequests mock data:', mockStore);
      return { requests: [...mockStore] };
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] getRequests 에러:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // [PATCH /requests/:id/status]  상태 변경
  // ----------------------------------------------------------
  async updateStatus(requestId: string, status: FittingStatus): Promise<FittingRequest> {
    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] updateStatus failed: ${response.status} ${response.statusText}`);
      }

      const apiData: ApiRequestItem = await response.json();
      const result = mapApiResponseToRequest(apiData);
      console.log('[apiRequestService] updateStatus response:', result);
      return result;
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(200);

      const index = mockStore.findIndex(r => r.requestId === requestId);
      if (index === -1) throw new Error(`[apiRequestService] Request ${requestId} not found`);

      mockStore[index] = { ...mockStore[index], status };
      console.log('[apiRequestService] updateStatus mock result:', mockStore[index]);
      return mockStore[index];
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] updateStatus 에러:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // [GET /admin/stats]  관리자 통계
  // ----------------------------------------------------------
  async getAdminStats(): Promise<AdminStats> {
    try {
      // ▼▼▼▼▼ 실제 fetch — 백엔드 준비 완료 시 아래 블록 주석 해제 ▼▼▼▼▼
      /*
      const response = await fetch(`${BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`[apiRequestService] getAdminStats failed: ${response.status} ${response.statusText}`);
      }

      const stats: AdminStats = await response.json();
      console.log('[apiRequestService] getAdminStats response:', stats);
      return stats;
      */
      // ▲▲▲▲▲ 실제 fetch 끝 ▲▲▲▲▲

      // ▼▼▼▼▼ mock 응답 — 실제 API 연동 시 이 블록 제거 ▼▼▼▼▼
      await simulateDelay(100);

      return {
        total: mockStore.length,
        pending: mockStore.filter(r => r.status === 'pending').length,
        assigned: mockStore.filter(r => r.status === 'assigned').length,
        completed: mockStore.filter(r => r.status === 'completed').length,
      };
      // ▲▲▲▲▲ mock 응답 끝 ▲▲▲▲▲

    } catch (error) {
      console.error('[apiRequestService] getAdminStats 에러:', error);
      throw error;
    }
  },
};

// ============================================================
// 내부 유틸 — 실제 API 연동 시 제거
// ============================================================

/** API 지연 시뮬레이션 (mock 전용) */
function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
