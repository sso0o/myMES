import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bomApi } from '../api/bomApi'
import type { BomBulkCopyRequest, BomSaveRequest } from '../types'

const QUERY_KEY = 'boms'
const VERSION_QUERY_KEY = 'bom-versions'

export const useBomList = (parentItemId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, parentItemId],
    queryFn: () => bomApi.getList(parentItemId as number).then((res) => res.data.data ?? []),
    enabled: parentItemId != null,
  })

export const useBomVersionHistory = (parentItemId: number | null) =>
  useQuery({
    queryKey: [VERSION_QUERY_KEY, parentItemId],
    queryFn: () =>
      bomApi.getVersionHistory(parentItemId as number).then((res) => res.data.data ?? []),
    enabled: parentItemId != null,
  })

export const useBomVersionLines = (parentItemId: number | null, versionId: number | null) =>
  useQuery({
    queryKey: [QUERY_KEY, parentItemId, 'version', versionId],
    queryFn: () =>
      bomApi
        .getVersionLines(parentItemId as number, versionId as number)
        .then((res) => res.data.data ?? []),
    enabled: parentItemId != null && versionId != null,
  })

export const useSaveBom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ parentItemId, data }: { parentItemId: number; data: BomSaveRequest }) =>
      bomApi.save(parentItemId, data).then((res) => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.parentItemId] })
      queryClient.invalidateQueries({ queryKey: [VERSION_QUERY_KEY, variables.parentItemId] })
    },
  })
}

export const useRestoreBomVersion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      parentItemId,
      versionId,
    }: {
      parentItemId: number
      versionId: number
    }) => bomApi.restore(parentItemId, versionId).then((res) => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.parentItemId] })
      queryClient.invalidateQueries({ queryKey: [VERSION_QUERY_KEY, variables.parentItemId] })
    },
  })
}

export const useBulkCopyBom = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BomBulkCopyRequest) => bomApi.bulkCopy(data).then((res) => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.sourceItemId] })
      variables.targetItemIds.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] }),
      )
    },
  })
}
