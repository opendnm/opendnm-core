import { useLoaderData, useOutletContext, useRevalidator } from "react-router"
import { useEffect, useRef } from "react"
import { RefreshCw, CheckCircle2, Clock, XCircle, Loader2, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { endpoints, type PipelineJob, type Domain } from "../../../lib/endpoints"
import { apiRequired } from "../../../lib/api.server"
import type { Route } from "./+types/$id.ns"
import { cn } from "../../../lib/utils"

interface DomainContext {
  domain: Domain
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request, params }: Route.LoaderArgs) {
  const jobs = await apiRequired(
    endpoints.pipeline.list({ request })
  )
  // 只取当前域名的 pipeline 记录
  const domainJobs = jobs.filter((j) => j.domain === params.id)
  return { jobs: domainJobs, domainId: params.id! }
}

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS: { key: PipelineJob["status"]; label: string; description: string }[] = [
  { key: "queued",     label: "Queued",          description: "Waiting to start" },
  { key: "adding_cf", label: "Adding to CF",     description: "Creating Cloudflare zone" },
  { key: "setting_ns",label: "Setting NS",       description: "Updating registrar nameservers" },
  { key: "polling",   label: "Verifying",        description: "Waiting for DNS propagation" },
  { key: "active",    label: "Active",           description: "Zone is live on Cloudflare" },
]

function StepIcon({ status, isCurrent, isFailed }: {
  status: "done" | "current" | "pending"
  isCurrent: boolean
  isFailed: boolean
}) {
  if (isFailed && isCurrent) return <XCircle className="h-5 w-5 text-rose-500" />
  if (status === "done")    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === "current") return <Loader2 className="h-5 w-5 animate-spin text-primary" />
  return <Clock className="h-5 w-5 text-muted-foreground/40" />
}

function PipelineSteps({ job }: { job: PipelineJob }) {
  const currentIdx = STEPS.findIndex((s) => s.key === job.status)
  const isFailed = job.status === "failed"

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, idx) => {
        const isDone    = idx < currentIdx || job.status === "active"
        const isCurrent = step.key === job.status
        const isPending = idx > currentIdx && job.status !== "active"
        const stepStatus = isDone ? "done" : isCurrent ? "current" : "pending"
        const isLast = idx === STEPS.length - 1

        return (
          <div key={step.key} className="flex gap-3">
            {/* 左侧：图标 + 连接线 */}
            <div className="flex flex-col items-center">
              <StepIcon status={stepStatus} isCurrent={isCurrent} isFailed={isFailed} />
              {!isLast && (
                <div
                  className={cn(
                    "my-1 w-px flex-1",
                    isDone ? "bg-emerald-500" : "bg-border"
                  )}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            {/* 右侧：文字 */}
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium leading-5",
                  isPending && "text-muted-foreground/50",
                  isCurrent && isFailed && "text-rose-500"
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DomainNs() {
  const { jobs, domainId } = useLoaderData<typeof loader>()
  const { domain } = useOutletContext<DomainContext>()
  const revalidator = useRevalidator()

  // 有运行中的 job 时每 10 秒自动轮询
  const latestJob = jobs[0] as PipelineJob | undefined
  const isRunning = latestJob &&
    !["active", "failed"].includes(latestJob.status)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => revalidator.revalidate(), 10_000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  async function handleRunPipeline() {
    const toastId = "pipeline"
    toast.loading(`Starting pipeline for ${domain.name}...`, {
      id: toastId,
      duration: Infinity,
    })
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domain.name }),
    })
    if (res.ok) {
      toast.success("Pipeline started", { id: toastId })
      revalidator.revalidate()
    } else {
      toast.error("Failed to start pipeline", {
        id: toastId,
        description: await res.text(),
      })
    }
  }

  function copyNs(ns: string) {
    navigator.clipboard.writeText(ns)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 左：Pipeline 状态 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">CF Pipeline</CardTitle>
            <CardDescription>
              Automates zone creation and NS propagation
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleRunPipeline} disabled={!!isRunning}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRunning && "animate-spin")} />
            {isRunning ? "Running..." : "Run Pipeline"}
          </Button>
        </CardHeader>
        <CardContent>
          {latestJob ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Job {latestJob.id}</span>
                <span>·</span>
                <span>
                  {new Date(latestJob.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto border-0 font-medium",
                    latestJob.status === "active"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : latestJob.status === "failed"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}
                >
                  {latestJob.status}
                </Badge>
              </div>
              <PipelineSteps job={latestJob} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No pipeline runs yet. Click "Run Pipeline" to start.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 右：Nameservers */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Nameservers</CardTitle>
          <CardDescription>
            Set these at your registrar to activate Cloudflare
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {latestJob?.name_servers?.length ? (
            <>
              {latestJob.name_servers.map((ns) => (
                <div
                  key={ns}
                  className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2"
                >
                  <span className="font-mono text-sm">{ns}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyNs(ns)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                DNS propagation can take up to 48 hours. The pipeline will
                automatically detect activation.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nameservers will appear here after the pipeline starts.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}