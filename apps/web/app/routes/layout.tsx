import { Outlet } from "react-router"
import { AppSidebar } from "../components/layout/app-sidebar"
import { DarkModeToggle } from "../components/layout/mode-toggle"
import { Avatar } from "../components/ui/avatar"
import { Separator } from "../components/ui/separator"
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar"

export default function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-1/2 data-[orientation=vertical]:self-center"
          />
          <div className="ml-auto flex items-center gap-2">
            <DarkModeToggle />
            <Avatar />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
