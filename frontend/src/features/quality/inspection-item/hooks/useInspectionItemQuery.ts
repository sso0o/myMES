import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commonCodeApi } from '@/features/master/commonCode/api/commonCodeApi'
import { inspectionItemApi } from '../api/inspectionItemApi'
import type { InspectionItemCreateRequest, InspectionItemUpdateRequest } from '../types'

const QUERY_KEY = 'inspectionItems'
const INSPECTION_ITEM_CATEGORY_GROUP_ID = 'QC_INSPECTION_ITEM'
const UNIT_GROUP_ID = 'ITEM_UNIT'

export const useInspectionItemCategoryOptions = () =>
  useQuery({
    queryKey: ['commonCodes', INSPECTION_ITEM_CATEGORY_GROUP_ID],
    queryFn: () =>
      commonCodeApi.getCodes(INSPECTION_ITEM_CATEGORY_GROUP_ID).then((res) => res.data.data ?? []),
  })

export const useUnitOptions = () =>
  useQuery({
    queryKey: ['commonCodes', UNIT_GROUP_ID],
    queryFn: () => commonCodeApi.getCodes(UNIT_GROUP_ID).then((res) => res.data.data ?? []),
  })

export const useInspectionItemList = () =>
  useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => inspectionItemApi.getList().then((res) => res.data.data ?? []),
  })

export const useCreateInspectionItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InspectionItemCreateRequest) =>
      inspectionItemApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateInspectionItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InspectionItemUpdateRequest }) =>
      inspectionItemApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteInspectionItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => inspectionItemApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
