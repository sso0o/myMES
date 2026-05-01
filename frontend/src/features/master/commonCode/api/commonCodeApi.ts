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
  getGroupList: () => api.get<ApiResponse<CodeGroupResponse[]>>('/master/code-groups'),
  getGroupById: (groupId: string) =>
    api.get<ApiResponse<CodeGroupResponse>>(`/master/code-groups/${groupId}`),
  createGroup: (data: CodeGroupCreateRequest) =>
    api.post<ApiResponse<CodeGroupResponse>>('/master/code-groups', data),
  updateGroup: (groupId: string, data: CodeGroupUpdateRequest) =>
    api.put<ApiResponse<CodeGroupResponse>>(`/master/code-groups/${groupId}`, data),
  deleteGroup: (groupId: string) => api.delete(`/master/code-groups/${groupId}`),

  getCodes: (groupId: string) =>
    api.get<ApiResponse<CommonCodeResponse[]>>(`/master/code-groups/${groupId}/codes`),
  createCode: (groupId: string, data: CommonCodeCreateRequest) =>
    api.post<ApiResponse<CommonCodeResponse>>(`/master/code-groups/${groupId}/codes`, data),
  updateCode: (groupId: string, codeId: number, data: CommonCodeUpdateRequest) =>
    api.put<ApiResponse<CommonCodeResponse>>(`/master/code-groups/${groupId}/codes/${codeId}`, data),
  deleteCode: (groupId: string, codeId: number) =>
    api.delete(`/master/code-groups/${groupId}/codes/${codeId}`),
}
