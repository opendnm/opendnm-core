import { useState } from "react"
import { useLoaderData, useRevalidator } from "react-router"
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import type { Route } from "./+types/api"
import { cn } from "../../lib/utils"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Separator } from "../../components/ui/separator"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldConfig {
  key: string
  label: string
  placeholder: string
  secret?: boolean
}

interface ApiProviderConfig {
  provider: string
  label: string
  description: string
  placeholder: string
  docsUrl: string
  icon: string
  fields: FieldConfig[]
}

interface SavedProvider {
  provider: string
  values: Record<string, string> // { api_key: "sk-••••3f2a", secret: "••••" }
  status: "valid" | "invalid" | "unchecked"
  verified_at?: string
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  //   const apiKeys = await apiRequired(
  //     endpoints.settings.apiKeys.list({ request })
  //   )
  //   return { apiKeys }
  const apiKeys = [
    {
      provider: "cloudflare",
      label: "cf",
      description: "asasdsad description",
      placeholder: "placeholder",
      docsUrl: "docsurl",
      icon: "web",
      status: "valid",
      values: { api_token: "abc123" },
    },
    {
      provider: "godaddy",
      label: "gd",
      description: "asasdsad description",
      placeholder: "placeholder",
      docsUrl: "docsurl",
      icon: "web",
      status: "invalid",
      values: { api_key: "abc123", api_secret: "xyz789" },
    },
  ]

  return { apiKeys }
}

// ─── Provider 配置清单 ────────────────────────────────────────────────────────

const API_PROVIDERS: ApiProviderConfig[] = [
  {
    provider: "stripe",
    label: "Stripe",
    description: "apikey and secret",
    placeholder: "apikey",
    docsUrl: "",
    icon: "",
    fields: [
      {
        key: "publishable_key",
        label: "Publishable Key",
        placeholder: "pk_live_...",
        secret: false,
      },
      {
        key: "secret_key",
        label: "Secret Key",
        placeholder: "sk_live_...",
        secret: true,
      },
    ],
  },
  {
    provider: "cloudflare",
    label: "Cloudflare",
    description:
      "Required for zone management, DNS records, SSL, and pipeline automation.",
    placeholder: "your-cloudflare-api-token",
    docsUrl: "https://dash.cloudflare.com/profile/api-tokens",
    icon: "🔶",
    fields: [
      {
        key: "api_token",
        label: "API Token",
        placeholder: "your-cloudflare-api-token",
        secret: true,
      },
    ],
  },
  {
    provider: "namecheap",
    label: "Namecheap",
    description: "Manage domains registered with Namecheap via API.",
    placeholder: "namecheap-api-key",
    docsUrl: "https://www.namecheap.com/support/api/intro",
    icon: "🔴",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        placeholder: "namecheap-api-key",
        secret: true,
      },
      {
        key: "username",
        label: "Account Username",
        placeholder: "your-namecheap-username",
        secret: false,
      },
    ],
  },
  {
    provider: "godaddy",
    label: "GoDaddy",
    description: "Manage domains registered with GoDaddy via API.",
    placeholder: "key:secret",
    docsUrl: "https://developer.godaddy.com/keys",
    icon: "🟢",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        placeholder: "godaddy-api-key",
        secret: true,
      },
      {
        key: "api_secret",
        label: "API Secret",
        placeholder: "godaddy-api-secret",
        secret: true,
      },
    ],
  },
  {
    provider: "dynadot",
    label: "Dynadot",
    description: "Manage domains registered with Dynadot via API.",
    placeholder: "dynadot-api-key",
    docsUrl: "https://www.dynadot.com/domain/api.html",
    icon: "🔵",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        placeholder: "dynadot-api-key",
        secret: true,
      },
    ],
  },
]

// ─── Secret Input ─────────────────────────────────────────────────────────────

function SecretInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)
  const isSecret = field.secret ?? false

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field.key}>{field.label}</Label>
      <div className="relative">
        <Input
          id={field.key}
          type={isSecret && !show ? "password" : "text"}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("font-mono text-sm", isSecret && "pr-10")}
        />
        {isSecret && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
            onClick={() => setShow((v) => !v)}
          >
            {show ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Provider Card ────────────────────────────────────────────────────────────

function ApiProviderCard({
  config,
  saved,
  onSave,
  onVerify,
  onDelete,
}: {
  config: ApiProviderConfig
  saved?: SavedProvider
  onSave: (provider: string, values: Record<string, string>) => Promise<void>
  onVerify: (provider: string) => Promise<void>
  onDelete: (provider: string) => Promise<void>
}) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(config.fields.map((f) => [f.key, ""]))
  )
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const isConfigured = Boolean(saved)
  const canSave = config.fields.every((f) => fieldValues[f.key]?.trim())

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    await onSave(config.provider, fieldValues)
    setFieldValues(Object.fromEntries(config.fields.map((f) => [f.key, ""])))
    setSaving(false)
  }

  async function handleVerify() {
    setVerifying(true)
    await onVerify(config.provider)
    setVerifying(false)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <CardTitle className="text-base">{config.label}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {config.description}
              </CardDescription>
            </div>
          </div>

          {isConfigured && (
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 border-0 font-medium",
                saved?.status === "valid"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : saved?.status === "invalid"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              )}
            >
              {saved?.status === "valid" ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : saved?.status === "invalid" ? (
                <XCircle className="mr-1 h-3 w-3" />
              ) : null}
              {saved?.status === "valid"
                ? "Connected"
                : saved?.status === "invalid"
                  ? "Invalid"
                  : "Unchecked"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* 已保存的字段（脱敏） */}
        {isConfigured && (
          <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3">
            {config.fields.map((field) => (
              <div key={field.key} className="flex items-center gap-2">
                <Key className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="w-28 shrink-0 text-xs text-muted-foreground">
                  {field.label}
                </span>
                <span className="flex-1 font-mono text-sm text-muted-foreground">
                  {saved?.values[field.key] ?? "—"}
                </span>
              </div>
            ))}
            {saved?.verified_at && (
              <p className="mt-1 text-right text-xs text-muted-foreground">
                Verified {new Date(saved.verified_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* 输入区域 */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            {isConfigured ? "Replace credentials" : "Enter credentials"}
          </p>
          {config.fields.map((field) => (
            <SecretInput
              key={field.key}
              field={field}
              value={fieldValues[field.key]}
              onChange={(v) => setField(field.key, v)}
            />
          ))}
          <div className="flex items-center justify-between pt-1">
            <a
              href={config.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              How to get your {config.label} credentials →
            </a>
            <Button
              size="sm"
              disabled={!canSave || saving}
              onClick={handleSave}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isConfigured ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        {/* 已配置时的额外操作 */}
        {isConfigured && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={verifying}
                onClick={handleVerify}
              >
                {verifying ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                )}
                Verify Connection
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-rose-500 hover:text-rose-600"
                onClick={() => onDelete(config.provider)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsApi() {
  const { apiKeys } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  function getSaved(provider: string): SavedProvider | undefined {
    return apiKeys.find(
      (k) => k.provider === provider
    ) as unknown as SavedProvider
  }

  async function handleSave(provider: string, values: Record<string, string>) {
    const res = await fetch("/api/settings/api-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, values }),
    })
    if (res.ok) {
      toast.success("Credentials saved")
      revalidator.revalidate()
    } else {
      toast.error("Failed to save credentials", {
        description: await res.text(),
      })
    }
  }

  async function handleVerify(provider: string) {
    const res = await fetch(`/api/settings/api-keys/${provider}/verify`, {
      method: "POST",
    })
    if (res.ok) toast.success("Connection verified ✓")
    else
      toast.error("Verification failed", {
        description: "Check your credentials and try again.",
      })
    revalidator.revalidate()
  }

  async function handleDelete(provider: string) {
    const label = API_PROVIDERS.find((p) => p.provider === provider)?.label
    if (!confirm(`Remove ${label} credentials?`)) return
    const res = await fetch(`/api/settings/api-keys/${provider}`, {
      method: "DELETE",
    })
    if (res.ok) {
      toast.success("Credentials removed")
      revalidator.revalidate()
    } else {
      toast.error("Failed to remove credentials")
    }
  }

  const connectedCount = apiKeys.filter((k) => k.status === "valid").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">API & Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect external services to enable automated domain management.{" "}
          <span className="font-medium text-foreground">
            {connectedCount} of {API_PROVIDERS.length}
          </span>{" "}
          providers connected.
        </p>
      </div>

      {!getSaved("cloudflare") && (
        <Alert>
          <AlertDescription className="text-sm">
            <span className="font-semibold">Cloudflare is required</span> to run
            pipelines, manage DNS records, and monitor SSL. Connect it first
            before adding registrar APIs.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        {API_PROVIDERS.map((config) => (
          <ApiProviderCard
            key={config.provider}
            config={config}
            saved={getSaved(config.provider)}
            onSave={handleSave}
            onVerify={handleVerify}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}
