import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  CodeGroupCreateRequest,
  CodeGroupResponse,
  CodeGroupUpdateRequest,
  CommonCodeCreateRequest,
  CommonCodeResponse,
  CommonCodeUpdateRequest,
} from '../types'

export const commonCodeApi = {
  getGroupList: () => api.get<ApiResponse<CodeGroupResponse[]>>('/code-groups'),
  getGroupById: (groupId: string) =>
    api.get<ApiResponse<CodeGroupResponse>>(`/code-groups/${groupId}`),
  createGroup: (data: CodeGroupCreateRequest) =>
    api.post<ApiResponse<CodeGroupResponse>>('/code-groups', data),
  updateGroup: (groupId: string, data: CodeGroupUpdateRequest) =>
    api.put<ApiResponse<CodeGroupResponse>>(`/code-groups/${groupId}`, data),
  deleteGroup: (groupId: string) => api.delete(`/code-groups/${groupId}`),

  getCodes: (groupId: string) =>
    api.get<ApiResponse<CommonCodeResponse[]>>(`/code-groups/${groupId}/codes`),
  createCode: (groupId: string, data: CommonCodeCreateRequest) =>
    api.post<ApiResponse<CommonCodeResponse>>(`/code-groups/${groupId}/codes`, data),
  updateCode: (groupId: string, codeId: number, data: CommonCodeUpdateRequest) =>
    api.put<ApiResponse<CommonCodeResponse>>(`/code-groups/${groupId}/codes/${codeId}`, data),
  deleteCode: (groupId: string, codeId: number) =>
    api.delete(`/code-groups/${groupId}/codes/${codeId}`),
}
