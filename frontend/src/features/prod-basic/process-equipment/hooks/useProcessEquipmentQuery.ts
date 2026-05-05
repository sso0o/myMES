import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { processEquipmentApi } from '../api/processEquipmentApi'
import type {
  ProcessEquipmentCreateRequest,
  ProcessEquipmentUpdateRequest,
} from '../types'

const QUERY_KEY = 'processEquipments'

export const useProcessEquipmentListByProcess = (processId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, 'process', processId],
    queryFn: () =>
      processEquipmentApi.getByProcessId(processId!).then((res) => res.data.data ?? []),
    enabled: processId !== null,
  })

export const useCreateProcessEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProcessEquipmentCreateRequest) =>
      processEquipmentApi.create(data).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'process', variables.processId] })
    },
  })
}

export const useUpdateProcessEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: ProcessEquipmentUpdateRequest
      processId: number
    }) => processEquipmentApi.update(id, data).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'process', variables.processId] })
    },
  })
}

export const useDeleteProcessEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; processId: number }) =>
      processEquipmentApi.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'process', variables.processId] })
    },
  })
}
