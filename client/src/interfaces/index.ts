export interface ApiResponse<T> {
  data?: T
  statusCode?: number
  message?: string
  success?: boolean
  timestamp?: string
}
