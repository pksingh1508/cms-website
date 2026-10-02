import { cookies } from "next/headers"
import { AppSidebar } from "@/components/shell/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireAdmin } from "@/lib/auth"
import { publicEnv } from "@/lib/public-env"

export default async function CmsLayout({ children }: LayoutProps<"/">) {
  const user = await requireAdmin()
  const defaultOpen = (await cookies()).get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar email={user.email} websiteUrl={publicEnv.websiteUrl} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
