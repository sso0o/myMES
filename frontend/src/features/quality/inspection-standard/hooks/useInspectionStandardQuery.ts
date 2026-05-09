import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commonCodeApi } from '@/features/master/commonCode/api/commonCodeApi'
import { inspectionStandardApi } from '../api/inspectionStandardApi'
import type { InspectionStandardCreateRequest, InspectionStandardUpdateRequest } from '../types'

const QUERY_KEY = 'inspectionStandards'
const INSPECTION_METHOD_GROUP_ID = 'QC_INSPECTION_METHOD'

export const useInspectionMethodOptions = () =>
  useQuery({
    queryKey: ['commonCodes', INSPECTION_METHOD_GROUP_ID],
    queryFn: () =>
      commonCodeApi.getCodes(INSPECTION_METHOD_GROUP_ID).then((res) => res.data.data ?? []),
  })

export const useInspectionStandardList = (itemId: number | null, processId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, itemId, processId],
    queryFn: () =>
      inspectionStandardApi.getList(itemId ?? undefined, processId ?? undefined).then((res) => res.data.data ?? []),
    enabled: itemId !== null && processId !== null,
  })

export const useCreateInspectionStandard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: InspectionStandardCreateRequest) =>
      inspectionStandardApi.create(data).then((res) => res.data.data),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.itemId, variables.processId] }),
  })
}

export const useUpdateInspectionStandard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: InspectionStandardUpdateRequest
      itemId: number
      processId: number
    }) => inspectionStandardApi.update(id, data).then((res) => res.data.data),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.itemId, variables.processId] }),
  })
}

export const useDeleteInspectionStandard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; itemId: number; processId: number }) =>
      inspectionStandardApi.delete(id),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.itemId, variables.processId] }),
  })
}
