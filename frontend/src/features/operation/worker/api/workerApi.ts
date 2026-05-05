import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  WorkerCreateRequest,
  WorkerResignRequest,
  WorkerResponse,
  WorkerUpdateRequest,
} from '../types'

const WORKER_API_PATH = '/operation/workers'

export const workerApi = {
  getList: () => api.get<ApiResponse<WorkerResponse[]>>(WORKER_API_PATH),
  getById: (id: number) => api.get<ApiResponse<WorkerResponse>>(`${WORKER_API_PATH}/${id}`),
  create: (data: WorkerCreateRequest) =>
    api.post<ApiResponse<WorkerResponse>>(WORKER_API_PATH, data),
  update: (id: number, data: WorkerUpdateRequest) =>
    api.put<ApiResponse<WorkerResponse>>(`${WORKER_API_PATH}/${id}`, data),
  resign: (id: number, data: WorkerResignRequest) =>
    api.patch<ApiResponse<WorkerResponse>>(`${WORKER_API_PATH}/${id}/resign`, data),
  delete: (id: number) => api.delete(`${WORKER_API_PATH}/${id}`),
}
