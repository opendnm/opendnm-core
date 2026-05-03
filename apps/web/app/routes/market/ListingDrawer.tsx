import { useState } from "react"
import { toast } from "sonner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "../../components/ui/drawer"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Switch } from "../../components/ui/switch"
import { Separator } from "../../components/ui/separator"
import { Badge } from "../../components/ui/badge"
import type { Domain } from "../../lib/endpoints"
import { cn } from "../../lib/utils"

interface ListingDrawerProps {
  domain: Domain | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ListingDrawer({
  domain,
  open,
  onClose,
  onSuccess,
}: ListingDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [listed, setListed] = useState(domain?.listed ?? false)

  // 当 domain 切换时同步 listed 状态
  const effectiveListed = domain ? listed : false

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!domain) return
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      listed: effectiveListed,
      price: form.get("price") ? Number(form.get("price")) : null,
      description: form.get("description") as string,
      sale_page_title: form.get("sale_page_title") as string,
    }

    const res = await fetch(`/api/domains/${domain.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

    if (res.ok) {
      toast.success(`${domain.name} updated`)
      onSuccess()
      onClose()
    } else {
      toast.error("Failed to update listing", {
        description: await res.text(),
      })
    }
  }

  // 跟随 domain 变化重置 listed
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
    else if (domain) setListed(domain.listed)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent className="max-w-md!">
        <DrawerHeader className="pb-4">
          <DrawerTitle>{domain?.name ?? "Edit Listing"}</DrawerTitle>
          <DrawerDescription>
            Configure how this domain appears on the marketplace
          </DrawerDescription>
          {/* CF status badge */}
          {domain && (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "border-0 font-medium",
                  domain.cf_status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}
              >
                CF {domain.cf_status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Expires{" "}
                {new Date(domain.expires_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </DrawerHeader>

        <form
          id="listing-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 overflow-y-auto px-4"
        >
          {/* ── Visibility ── */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Visibility
            </p>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">List on Marketplace</p>
                <p className="text-xs text-muted-foreground">
                  Make this domain visible to buyers
                </p>
              </div>
              <Switch
                checked={effectiveListed}
                onCheckedChange={setListed}
              />
            </div>
          </div>

          <Separator />

          {/* ── Pricing ── */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pricing
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Ask Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  defaultValue={domain?.price ?? ""}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to accept offers only
              </p>
            </div>
          </div>

          <Separator />

          {/* ── Sale Page ── */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sale Page Content
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sale_page_title">Page Title</Label>
              <Input
                id="sale_page_title"
                name="sale_page_title"
                placeholder={`${domain?.name ?? "domain"} is for sale`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe why this domain is valuable..."
                className="min-h-30 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Shown on the domain's sale landing page
              </p>
            </div>
          </div>
        </form>

        <DrawerFooter className="border-t pt-4">
          <Button type="submit" form="listing-form" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}