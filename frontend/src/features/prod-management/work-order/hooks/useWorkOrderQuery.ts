import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workOrderApi } from '../api/workOrderApi'
import type { WorkOrderStatus, WorkOrderUpdateRequest } from '../types'

const QUERY_KEY = 'workOrders'

export const useWorkOrderList = (status?: WorkOrderStatus) =>
  useQuery({
    queryKey: [QUERY_KEY, status],
    queryFn: () => workOrderApi.getList(status).then((res) => res.data.data ?? []),
  })

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkOrderUpdateRequest }) =>
      workOrderApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useChangeWorkOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: WorkOrderStatus }) =>
      workOrderApi.changeStatus(id, status).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
