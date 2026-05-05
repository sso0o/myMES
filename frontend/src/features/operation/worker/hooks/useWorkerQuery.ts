import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workerApi } from '../api/workerApi'
import type {
  WorkerCreateRequest,
  WorkerResignRequest,
  WorkerUpdateRequest,
} from '../types'

const QUERY_KEY = 'workers'

export const useWorkerList = () =>
  useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => workerApi.getList().then((res) => res.data.data ?? []),
  })

export const useCreateWorker = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkerCreateRequest) =>
      workerApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateWorker = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkerUpdateRequest }) =>
      workerApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useResignWorker = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkerResignRequest }) =>
      workerApi.resign(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteWorker = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => workerApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
