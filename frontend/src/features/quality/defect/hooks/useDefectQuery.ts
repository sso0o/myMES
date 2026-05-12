import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { defectApi } from '../api/defectApi'
import type { DefectActionUpdateRequest } from '../types'

const QUERY_KEY = 'defects'

export const useDefectList = () =>
  useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => defectApi.getAll().then((res) => res.data.data ?? []),
  })

export const useUpdateDefectAction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DefectActionUpdateRequest }) =>
      defectApi.updateAction(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
