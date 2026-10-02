"use client"

import { GlobeIcon, LayoutDashboardIcon, LogOutIcon, UserRoundIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/actions/auth"
import { Brand } from "@/components/brand"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { COLLECTIONS } from "@/config/collections"

export function AppSidebar({ email, websiteUrl }: { email: string; websiteUrl: string }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <Brand />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={pathname === "/"} tooltip="Home" render={<Link href="/" />}>
                <LayoutDashboardIcon />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarMenu>
            {COLLECTIONS.map((c) => {
              const active = pathname === `/${c.slug}` || pathname.startsWith(`/${c.slug}/`)
              return (
                <SidebarMenuItem key={c.slug}>
                  <SidebarMenuButton isActive={active} tooltip={c.label} render={<Link href={`/${c.slug}`} />}>
                    <c.icon />
                    <span>{c.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {websiteUrl && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Open website"
                render={<a href={websiteUrl} target="_blank" rel="noreferrer" />}
              >
                <GlobeIcon />
                <span>Open website</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <div
              className="flex h-8 items-center gap-2 overflow-hidden px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden"
              title={email}
            >
              <UserRoundIcon className="size-4 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" tooltip="Sign out">
                <LogOutIcon />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
