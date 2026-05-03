 import { useState } from "react"
import { useLoaderData } from "react-router"
import { Loader2, Save, Key } from "lucide-react"
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
import { Separator } from "../../components/ui/separator"
import type { Route } from "./+types/account"

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
//   const account = await apiRequired(
//     endpoints.settings.account.get({ request })
//   )
const account = {email: "hel@world.com", name: "asdasdasda"}
  return { account }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsAccount() {
  const { account } = useLoaderData<typeof loader>()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingProfile(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch("/api/settings/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
      }),
    })

    setSavingProfile(false)
    if (res.ok) toast.success("Profile updated")
    else toast.error("Failed to update profile", { description: await res.text() })
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    if (form.get("new_password") !== form.get("confirm_password")) {
      toast.error("Passwords do not match")
      return
    }

    setSavingPassword(true)
    const res = await fetch("/api/settings/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: form.get("current_password"),
        password: form.get("new_password"),
      }),
    })

    setSavingPassword(false)
    if (res.ok) {
      toast.success("Password changed")
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast.error("Failed to change password", {
        description: "Check your current password and try again.",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile information and security settings.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>
            Update your display name and email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={account.name}
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={account.email}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <Button type="submit" size="sm" disabled={savingProfile}>
                {savingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>
            Use a strong password that you don't use anywhere else.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <div>
              <Button type="submit" size="sm" disabled={savingPassword}>
                {savingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}