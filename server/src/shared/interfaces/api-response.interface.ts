export interface ApiResponse<T> {
  data?: T
  statusCode?: number
  message?: string
}

export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true
  timestamp: string
}
