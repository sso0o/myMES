import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planningApi } from '../api/planningApi'
import type {
  PlanStatus,
  ProductionPlanCreateRequest,
  ProductionPlanUpdateRequest,
} from '../types'

const QUERY_KEY = 'productionPlans'

export const usePlanningList = (status?: PlanStatus) =>
  useQuery({
    queryKey: [QUERY_KEY, status],
    queryFn: () => planningApi.getList(status).then((res) => res.data.data ?? []),
  })

export const useCreatePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductionPlanCreateRequest) =>
      planningApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdatePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductionPlanUpdateRequest }) =>
      planningApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useChangePlanStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: PlanStatus }) =>
      planningApi.changeStatus(id, { status }).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeletePlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => planningApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useBulkConfirmPlans = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planIds: number[]) =>
      planningApi.bulkConfirm(planIds).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useBulkReleasePlans = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planIds: number[]) =>
      planningApi.bulkRelease(planIds).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
