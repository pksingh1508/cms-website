"use client"

import {
  ArrowUpRightIcon,
  ChevronsUpDownIcon,
  GlobeIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useTransition } from "react"
import { logout } from "@/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { useIsClient } from "@/hooks/use-is-client"
import { centerOf, switchTheme, type ThemeChoice } from "@/lib/theme-transition"

const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const

/** The signed-in admin, with the website link, the theme and sign out. */
export function NavUser({ email, websiteUrl }: { email: string; websiteUrl: string }) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const isClient = useIsClient()
  const [signingOut, startSignOut] = useTransition()
  const name = email.split("@")[0] || "Admin"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="aria-expanded:bg-sidebar-accent group-data-[collapsible=icon]:p-0!"
              />
            }
          >
            <UserAvatar name={name} />
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">{name}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </span>
            <ChevronsUpDownIcon className="ml-auto text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={8} className="min-w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2.5 px-2 py-1.5 font-normal">
                <UserAvatar name={name} />
                <span className="grid min-w-0 leading-tight">
                  <span className="truncate text-sm font-medium text-foreground">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {websiteUrl && (
              <DropdownMenuItem render={<a href={websiteUrl} target="_blank" rel="noreferrer" />}>
                <GlobeIcon />
                Open website
                <ArrowUpRightIcon className="ml-auto text-muted-foreground" />
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={isClient ? theme : undefined}
              onValueChange={(value: ThemeChoice, details) => {
                const target = details.event?.target
                switchTheme(value, setTheme, target instanceof Element ? centerOf(target) : undefined)
              }}
            >
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              {THEMES.map((t) => (
                <DropdownMenuRadioItem key={t.value} value={t.value}>
                  <t.icon />
                  {t.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={signingOut} closeOnClick={false} onClick={() => startSignOut(() => logout())}>
              {signingOut ? <Spinner /> : <LogOutIcon />}
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function UserAvatar({ name }: { name: string }) {
  return (
    <Avatar className="size-8 rounded-lg after:rounded-lg">
      <AvatarFallback className="rounded-lg bg-linear-to-br from-zinc-700 to-zinc-950 text-[11px] font-semibold tracking-wide text-white uppercase dark:from-zinc-200 dark:to-zinc-400 dark:text-zinc-900">
        {name.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  )
}
