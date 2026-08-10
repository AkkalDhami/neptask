import axios from "axios"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (axios.isAxiosError(error)) {
      throw (
        error.response?.data ?? {
          success: false,
          statusCode: 500,
          message: "Something went wrong",
        }
      )
    }

    throw error
  }
)

// Request
// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       const token = localStorage.getItem("accessToken")

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//       }
//     }

//     return config
//   },
//   (error) => Promise.reject(error)
// )

// Response
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       console.log("Unauthorized")
//       // refresh token logic
//     }

//     return Promise.reject(error)
//   }
// )
