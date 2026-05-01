import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commonCodeApi } from '../api/commonCodeApi'
import type {
  CodeGroupCreateRequest,
  CodeGroupUpdateRequest,
  CommonCodeCreateRequest,
  CommonCodeUpdateRequest,
} from '../types'

const GROUP_KEY = 'code-groups'

export const useCodeGroupList = () =>
  useQuery({
    queryKey: [GROUP_KEY],
    queryFn: async () => {
      const res = await commonCodeApi.getGroupList()
      return res.data.data ?? []
    },
  })

export const useCodeGroupDetail = (groupId: string | null) =>
  useQuery({
    queryKey: [GROUP_KEY, groupId],
    queryFn: async () => {
      const res = await commonCodeApi.getGroupById(groupId!)
      return res.data.data
    },
    enabled: !!groupId,
  })

export const useCreateCodeGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CodeGroupCreateRequest) => {
      const res = await commonCodeApi.createGroup(data)
      return res.data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUP_KEY] }),
  })
}

export const useUpdateCodeGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: CodeGroupUpdateRequest }) => {
      const res = await commonCodeApi.updateGroup(groupId, data)
      return res.data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUP_KEY] }),
  })
}

export const useDeleteCodeGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => commonCodeApi.deleteGroup(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [GROUP_KEY] }),
  })
}

export const useCreateCommonCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ groupId, data }: { groupId: string; data: CommonCodeCreateRequest }) => {
      const res = await commonCodeApi.createCode(groupId, data)
      return res.data.data
    },
    onSuccess: (_, { groupId }) =>
      queryClient.invalidateQueries({ queryKey: [GROUP_KEY, groupId] }),
  })
}

export const useUpdateCommonCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      groupId,
      codeId,
      data,
    }: {
      groupId: string
      codeId: number
      data: CommonCodeUpdateRequest
    }) => {
      const res = await commonCodeApi.updateCode(groupId, codeId, data)
      return res.data.data
    },
    onSuccess: (_, { groupId }) =>
      queryClient.invalidateQueries({ queryKey: [GROUP_KEY, groupId] }),
  })
}

export const useDeleteCommonCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, codeId }: { groupId: string; codeId: number }) =>
      commonCodeApi.deleteCode(groupId, codeId),
    onSuccess: (_, { groupId }) =>
      queryClient.invalidateQueries({ queryKey: [GROUP_KEY, groupId] }),
  })
}
