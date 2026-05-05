export const WorkerStatus = {
  ACTIVE: 'ACTIVE',
  ON_LEAVE: 'ON_LEAVE',
  RESIGNED: 'RESIGNED',
} as const

export type WorkerStatus = (typeof WorkerStatus)[keyof typeof WorkerStatus]

export interface WorkerResponse {
  id: number
  workerCode: string
  workerName: string
  phone: string | null
  department: string | null
  jobTitle: string | null
  status: WorkerStatus
  hireDate: string | null
  resignedAt: string | null
  description: string | null
  createdAt: string
  updatedAt: string | null
}

export interface WorkerCreateRequest {
  workerName: string
  phone?: string
  department?: string
  jobTitle?: string
  hireDate?: string
  description?: string
}

export interface WorkerUpdateRequest {
  workerName: string
  phone?: string
  department?: string
  jobTitle?: string
  status: WorkerStatus
  hireDate?: string
  resignedAt?: string
  description?: string
}

export interface WorkerResignRequest {
  resignedAt: string
}
