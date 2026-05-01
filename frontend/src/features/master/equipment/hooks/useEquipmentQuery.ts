import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { commonCodeApi } from '@/features/master/commonCode/api/commonCodeApi'
import { equipmentApi } from '../api/equipmentApi'
import type { EquipmentCreateRequest, EquipmentUpdateRequest } from '../types'

const QUERY_KEY = 'equipment'

export const useEquipmentTypeOptions = () =>
  useQuery({
    queryKey: ['commonCodes', 'EQUIPMENT_TYPE'],
    queryFn: () => commonCodeApi.getCodes('EQUIPMENT_TYPE').then((res) => res.data.data ?? []),
  })

export const useEquipmentList = () =>
  useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => equipmentApi.getList().then((res) => res.data.data ?? []),
  })

export const useCreateEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EquipmentCreateRequest) =>
      equipmentApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EquipmentUpdateRequest }) =>
      equipmentApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => equipmentApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
