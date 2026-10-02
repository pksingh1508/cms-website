import Link from "next/link"
import { Fragment, type ReactNode } from "react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export type Crumb = { label: string; href?: string }

export function PageHeader({ crumbs, children }: { crumbs: Crumb[]; children?: ReactNode }) {
  return (
    <header className="glass sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 px-3 sm:px-4">
      <SidebarTrigger className="-ml-0.5 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mr-1.5 data-vertical:h-4 data-vertical:self-center" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((crumb, index) => (
            <Fragment key={crumb.label}>
              {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
              <BreadcrumbItem className={index === crumbs.length - 1 ? "min-w-0" : "shrink-0"}>
                {crumb.href ? (
                  <BreadcrumbLink render={<Link href={crumb.href} />} className="transition-colors">
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate font-medium">{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {children}
        <ThemeToggle className="size-8" />
      </div>
    </header>
  )
}
