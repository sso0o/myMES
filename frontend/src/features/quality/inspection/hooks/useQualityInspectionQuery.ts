import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { qualityInspectionApi } from '../api/qualityInspectionApi'
import type {
  QualityInspectionCreateRequest,
  QualityInspectionStatus,
  QualityInspectionUpdateRequest,
} from '../types'

const QUERY_KEY = 'qualityInspections'

export const useQualityInspectionList = (status?: QualityInspectionStatus) =>
  useQuery({
    queryKey: [QUERY_KEY, status ?? 'ALL'],
    queryFn: () => qualityInspectionApi.getList(status).then((res) => res.data.data ?? []),
  })

export const useCreateQualityInspection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QualityInspectionCreateRequest) =>
      qualityInspectionApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateQualityInspection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QualityInspectionUpdateRequest }) =>
      qualityInspectionApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteQualityInspection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => qualityInspectionApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
