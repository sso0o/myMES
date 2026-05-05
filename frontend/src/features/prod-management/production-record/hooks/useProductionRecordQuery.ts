import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productionRecordApi } from '../api/productionRecordApi'
import type { ProductionRecordCreateRequest, ProductionRecordUpdateRequest } from '../types'

const QUERY_KEY = 'productionRecords'

export const useProductionRecordList = (workOrderId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, workOrderId],
    queryFn: () =>
      productionRecordApi.getByWorkOrder(workOrderId!).then((res) => res.data.data ?? []),
    enabled: workOrderId !== null,
  })

export const useCreateProductionRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      workOrderId,
      data,
    }: {
      workOrderId: number
      data: ProductionRecordCreateRequest
    }) => productionRecordApi.create(workOrderId, data).then((res) => res.data.data),
    onSuccess: (_, { workOrderId }) =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, workOrderId] }),
  })
}

export const useUpdateProductionRecord = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductionRecordUpdateRequest }) =>
      productionRecordApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
