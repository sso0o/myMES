import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commonCodeApi } from '@/features/master/api/commonCodeApi'
import { processApi } from '../api/processApi'
import type { ProcessCreateRequest, ProcessUpdateRequest } from '../types'

const QUERY_KEY = 'processes'

export const useProcessTypeOptions = () =>
  useQuery({
    queryKey: ['commonCodes', 'PROCESS_TYPE'],
    queryFn: () => commonCodeApi.getCodes('PROCESS_TYPE').then((res) => res.data.data ?? []),
  })

export const useProcessList = () =>
  useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => processApi.getList().then((res) => res.data.data ?? []),
  })

export const useCreateProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProcessCreateRequest) =>
      processApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProcessUpdateRequest }) =>
      processApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteProcess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => processApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
