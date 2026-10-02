"use client"

import { LayoutDashboardIcon, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brand } from "@/components/brand"
import { TONE_TEXT } from "@/components/collection-icon"
import { NavUser } from "@/components/shell/nav-user"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { COLLECTIONS } from "@/config/collections"
import { cn } from "@/lib/utils"

export function AppSidebar({ email, websiteUrl }: { email: string; websiteUrl: string }) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              className="hover:bg-transparent active:bg-transparent"
            >
              <Brand />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <NavItem href="/" label="Home" icon={LayoutDashboardIcon} active={pathname === "/"} />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {COLLECTIONS.map((c) => (
              <NavItem
                key={c.slug}
                href={`/${c.slug}`}
                label={c.label}
                icon={c.icon}
                activeIconClassName={TONE_TEXT[c.tone]}
                active={pathname === `/${c.slug}` || pathname.startsWith(`/${c.slug}/`)}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser email={email} websiteUrl={websiteUrl} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  activeIconClassName = "text-brand-ink",
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  activeIconClassName?: string
}) {
  const { isMobile, setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={label}
        render={<Link href={href} onClick={() => isMobile && setOpenMobile(false)} />}
        className="data-active:bg-transparent data-active:font-medium"
      >
        {/* The highlight slides from the old item to the new one */}
        {active && (
          <motion.span
            layoutId="sidebar-active-item"
            transition={{ type: "spring", stiffness: 520, damping: 40 }}
            className="absolute inset-0 -z-10 rounded-lg bg-card shadow-sm ring-1 ring-foreground/[0.06] dark:bg-white/[0.07] dark:ring-white/[0.06]"
          />
        )}
        <Icon
          className={cn(
            "transition-[color,transform] duration-200 group-hover/menu-button:scale-110",
            active ? activeIconClassName : "text-muted-foreground group-hover/menu-button:text-foreground",
          )}
        />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
