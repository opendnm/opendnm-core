import { api } from "./api.server"
import type { RequestOptions } from "./api.server"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Domain {
  id: string
  name: string
  registrar: string
  expires_at: string
  cf_zone_id: string | null
  cf_status: "active" | "pending" | "inactive"
  ssl_status: "active" | "expiring" | "expired" | "none"
  listed: boolean
  price: number | null
}

export interface DnsRecord {
  id: string
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS"
  name: string
  content: string
  ttl: number
  proxied: boolean
}

export interface Order {
  id: string
  domain: string
  buyer: string
  amount: number
  status: "pending" | "processing" | "completed" | "cancelled"
  created_at: string
}

export interface Quote {
  id: string
  domain: string
  from_email: string
  offer: number
  message: string
  status: "unread" | "read" | "replied"
  created_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  created_at: string
}

export interface DashboardStats {
  total_domains: number
  cf_active_zones: number
  expiring_soon: number
  total_sales: number
  sales_change_pct: number
}

export interface PipelineJob {
  id: string
  domain: string
  status: "queued" | "adding_cf" | "setting_ns" | "polling" | "active" | "failed"
  name_servers: string[]
  created_at: string
  updated_at: string
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const endpoints = {
  // Dashboard
  dashboard: {
    stats: (opts: RequestOptions) =>
      api.get<DashboardStats>("/api/dashboard/stats", opts),
    traffic: (opts: RequestOptions) =>
      api.get<{ date: string; visits: number }[]>("/api/dashboard/traffic", opts),
    regions: (opts: RequestOptions) =>
      api.get<{ region: string; visits: number }[]>("/api/dashboard/regions", opts),
  },

  // Domains
  domains: {
    list: (params: { page?: number; q?: string; status?: string }, opts: RequestOptions) =>
      api.get<{ items: Domain[]; total: number }>("/api/domains", { ...opts, params }),
    get: (id: string, opts: RequestOptions) =>
      api.get<Domain>(`/api/domains/${id}`, opts),
    create: (body: Partial<Domain>, opts: RequestOptions) =>
      api.post<Domain>("/api/domains", body, opts),
    update: (id: string, body: Partial<Domain>, opts: RequestOptions) =>
      api.patch<Domain>(`/api/domains/${id}`, body, opts),
    delete: (id: string, opts: RequestOptions) =>
      api.delete(`/api/domains/${id}`, opts),

    // DNS
    dns: {
      list: (domainId: string, opts: RequestOptions) =>
        api.get<DnsRecord[]>(`/api/domains/${domainId}/dns`, opts),
      create: (domainId: string, body: Partial<DnsRecord>, opts: RequestOptions) =>
        api.post<DnsRecord>(`/api/domains/${domainId}/dns`, body, opts),
      update: (domainId: string, recordId: string, body: Partial<DnsRecord>, opts: RequestOptions) =>
        api.patch<DnsRecord>(`/api/domains/${domainId}/dns/${recordId}`, body, opts),
      delete: (domainId: string, recordId: string, opts: RequestOptions) =>
        api.delete(`/api/domains/${domainId}/dns/${recordId}`, opts),
    },
  },

  // Pipeline
  pipeline: {
    list: (opts: RequestOptions) =>
      api.get<PipelineJob[]>("/api/pipeline", opts),
    start: (domain: string, opts: RequestOptions) =>
      api.post<PipelineJob>("/api/pipeline", { domain }, opts),
    get: (jobId: string, opts: RequestOptions) =>
      api.get<PipelineJob>(`/api/pipeline/${jobId}`, opts),
  },

  // Marketplace
  market: {
    orders: {
      list: (params: { page?: number; status?: string }, opts: RequestOptions) =>
        api.get<{ items: Order[]; total: number }>("/api/market/orders", { ...opts, params }),
      get: (id: string, opts: RequestOptions) =>
        api.get<Order>(`/api/market/orders/${id}`, opts),
      update: (id: string, body: Partial<Order>, opts: RequestOptions) =>
        api.patch<Order>(`/api/market/orders/${id}`, body, opts),
    },
    quotes: {
      list: (params: { page?: number; status?: string }, opts: RequestOptions) =>
        api.get<{ items: Quote[]; total: number }>("/api/market/quotes", { ...opts, params }),
      reply: (id: string, body: { message: string }, opts: RequestOptions) =>
        api.post(`/api/market/quotes/${id}/reply`, body, opts),
    },
    contacts: {
      list: (params: { page?: number; status?: string }, opts: RequestOptions) =>
        api.get<{ items: Contact[]; total: number }>("/api/market/contacts", { ...opts, params }),
      reply: (id: string, body: { message: string }, opts: RequestOptions) =>
        api.post(`/api/market/contacts/${id}/reply`, body, opts),
    },
  },

  // Settings
  settings: {
    apiKeys: {
      list: (opts: RequestOptions) =>
        api.get<{ provider: string; key: string; status: "valid" | "invalid" }[]>(
          "/api/settings/api-keys",
          opts
        ),
      save: (body: { provider: string; key: string }, opts: RequestOptions) =>
        api.put("/api/settings/api-keys", body, opts),
    },
    account: {
      get: (opts: RequestOptions) =>
        api.get<{ email: string; name: string }>("/api/settings/account", opts),
      update: (body: { email?: string; name?: string; password?: string }, opts: RequestOptions) =>
        api.patch("/api/settings/account", body, opts),
    },
  },
}