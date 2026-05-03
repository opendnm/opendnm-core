import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"

// ─── Config ───────────────────────────────────────────────────────────────────

const NOTIFICATION_GROUPS = [
  {
    group: "Domains",
    items: [
      { key: "domain_expiring_30", label: "Domain expiring in 30 days", defaultChecked: true },
      { key: "domain_expiring_7",  label: "Domain expiring in 7 days",  defaultChecked: true },
      { key: "domain_expired",     label: "Domain expired",             defaultChecked: true },
      { key: "ssl_expiring",       label: "SSL certificate expiring",   defaultChecked: true },
    ],
  },
  {
    group: "Pipeline",
    items: [
      { key: "pipeline_active", label: "Pipeline activated successfully", defaultChecked: true },
      { key: "pipeline_failed", label: "Pipeline failed",                 defaultChecked: true },
    ],
  },
  {
    group: "Marketplace",
    items: [
      { key: "new_order",   label: "New order received",  defaultChecked: true },
      { key: "new_quote",   label: "New quote email",     defaultChecked: true },
      { key: "new_contact", label: "New contact message", defaultChecked: true },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsNotifications() {
  const [saving, setSaving] = useState(false)
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NOTIFICATION_GROUPS.flatMap((g) =>
        g.items.map((item) => [item.key, item.defaultChecked])
      )
    )
  )

  function toggle(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch("/api/settings/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    })
    setSaving(false)
    if (res.ok) toast.success("Notification preferences saved")
    else toast.error("Failed to save preferences")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Choose which events you want to be notified about.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {NOTIFICATION_GROUPS.map(({ group, items }) => (
          <div key={group} className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group}
            </p>
            <Card>
              <CardContent className="divide-y p-0">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <Label
                      htmlFor={item.key}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {item.label}
                    </Label>
                    <Switch
                      id={item.key}
                      checked={prefs[item.key]}
                      onCheckedChange={() => toggle(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}