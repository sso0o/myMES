import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bomApi } from '../api/bomApi'
import type { BomCreateRequest, BomUpdateRequest } from '../types'

const QUERY_KEY = 'boms'

export const useBomList = (parentItemId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, parentItemId],
    queryFn: () => bomApi.getList(parentItemId as number).then((res) => res.data.data ?? []),
    enabled: parentItemId != null,
  })

export const useCreateBom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BomCreateRequest) => bomApi.create(data).then((res) => res.data.data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.parentItemId] }),
  })
}

export const useUpdateBom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: BomUpdateRequest
      parentItemId: number
    }) => bomApi.update(id, data).then((res) => res.data.data),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.parentItemId] }),
  })
}

export const useDeleteBom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; parentItemId: number }) => bomApi.delete(id),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.parentItemId] }),
  })
}
