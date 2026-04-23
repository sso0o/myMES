export interface Pagination {
  page: number
  size: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  pagination: Pagination | null
  message: string | null
  code: string | null
}
