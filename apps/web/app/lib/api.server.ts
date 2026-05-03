import { redirect } from "react-router"

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string }

export interface RequestOptions {
  /** 透传请求的 Cookie（在 loader 中使用） */
  request?: Request
  /** 额外的请求头 */
  headers?: Record<string, string>
  /** 请求体 */
  body?: unknown
  /** 查询参数 */
  params?: Record<string, string | number | boolean | undefined>
}

// ─── Core ─────────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { request, headers, body, params } = options

  // 拼接查询参数
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  // 透传 Cookie（SSR loader 中认证用）
  const cookie = request?.headers.get("Cookie") ?? ""

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    // 未登录 → 跳转登录页
    if (res.status === 401) {
      throw redirect("/login")
    }

    // 无内容的成功响应（204 等）
    if (res.status === 204) {
      return { ok: true, data: null as T }
    }

    const json = await res.json()

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: json?.message ?? json?.detail ?? res.statusText,
      }
    }

    return { ok: true, data: json as T }
  } catch (err) {
    // redirect() 抛出的 Response 需要继续抛出，不能被 catch 吞掉
    if (err instanceof Response) throw err

    return {
      ok: false,
      status: 0,
      message: err instanceof Error ? err.message : "Network error",
    }
  }
}

// ─── Methods ──────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>("GET", path, options),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    apiFetch<T>("POST", path, { ...options, body }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    apiFetch<T>("PUT", path, { ...options, body }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    apiFetch<T>("PATCH", path, { ...options, body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>("DELETE", path, options),
}

// ─── Helper：loader 中统一处理错误 ────────────────────────────────────────────
// 用法: const data = await apiOr404(api.get(...))
// 请求失败时自动抛出对应 HTTP 错误，交由 ErrorBoundary 处理

export async function apiRequired<T>(
  promise: Promise<ApiResponse<T>>
): Promise<T> {
  const res = await promise
  if (!res.ok) {
    throw new Response(res.message, { status: res.status || 500 })
  }
  return res.data
}