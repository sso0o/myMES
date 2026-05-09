import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { itemProcessApi } from '../api/itemProcessApi'
import type {
  ItemProcessBulkCopyRequest,
  ItemProcessCreateRequest,
  ItemProcessUpdateRequest,
} from '../types'

const QUERY_KEY = 'itemProcesses'
const ITEMS_WITH_PROCESSES_QUERY_KEY = 'itemsWithProcesses'

export const useItemsWithProcesses = () =>
  useQuery({
    queryKey: [ITEMS_WITH_PROCESSES_QUERY_KEY],
    queryFn: () => itemProcessApi.getItemsWithProcesses().then((res) => res.data.data ?? []),
  })

export const useItemProcessList = (itemId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, itemId],
    queryFn: () =>
      itemProcessApi.getByItemId(itemId!).then((res) => res.data.data ?? []),
    enabled: itemId !== null,
  })

export const useCreateItemProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemProcessCreateRequest) =>
      itemProcessApi.create(data).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.itemId] })
      queryClient.invalidateQueries({ queryKey: [ITEMS_WITH_PROCESSES_QUERY_KEY] })
    },
  })
}

export const useUpdateItemProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemProcessUpdateRequest; itemId: number }) =>
      itemProcessApi.update(id, data).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.itemId] })
      queryClient.invalidateQueries({ queryKey: [ITEMS_WITH_PROCESSES_QUERY_KEY] })
    },
  })
}

export const useDeleteItemProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; itemId: number }) => itemProcessApi.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.itemId] })
      queryClient.invalidateQueries({ queryKey: [ITEMS_WITH_PROCESSES_QUERY_KEY] })
    },
  })
}

export const useBulkCopyItemProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemProcessBulkCopyRequest) =>
      itemProcessApi.bulkCopy(data).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      // 원본 품목과 모든 대상 품목의 캐시를 갱신
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.sourceItemId] })
      variables.targetItemIds.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] }),
      )
      queryClient.invalidateQueries({ queryKey: [ITEMS_WITH_PROCESSES_QUERY_KEY] })
    },
  })
}
