import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemApi } from '../api/itemApi'
import { commonCodeApi } from '../../commonCode/api/commonCodeApi'
import type { ItemCreateRequest, ItemUpdateRequest } from '../types'

const QUERY_KEY = 'items'

export const useItemTypeOptions = () =>
  useQuery({
    queryKey: ['commonCodes', 'ITEM_TYPE'],
    queryFn: () => commonCodeApi.getCodes('ITEM_TYPE').then((res) => res.data.data ?? []),
  })

export const useItemUnitOptions = () =>
  useQuery({
    queryKey: ['commonCodes', 'ITEM_UNIT'],
    queryFn: () => commonCodeApi.getCodes('ITEM_UNIT').then((res) => res.data.data ?? []),
  })

export const useItemList = (page: number, size: number = 20) =>
  useQuery({
    queryKey: [QUERY_KEY, page, size],
    queryFn: () => itemApi.getList(page, size).then((res) => res.data),
  })

export const useCreateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemCreateRequest) => itemApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemUpdateRequest }) =>
      itemApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => itemApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
