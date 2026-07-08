const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export type ApiError = {
  detail?: string
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Request failed. Please try again."
    )
  }

  return data as T
}

export type LoginResponse = {
  access_token: string
  token_type: string
}

export type UserProfile = {
  id: number
  username: string
  email: string
  xp: number
  streak: number
}

export const api = {
  register(body: { username: string; email: string; password: string }) {
    return request<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  login(body: { email: string; password: string }) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  me(token: string) {
    return request<UserProfile>("/auth/me", {}, token)
  },
}

export { API_URL }
