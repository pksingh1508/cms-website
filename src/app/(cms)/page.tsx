import { ArrowRightIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { ButtonLink } from "@/components/button-link"
import { PageHeader } from "@/components/shell/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { COLLECTIONS } from "@/config/collections"
import { requireAdmin } from "@/lib/auth"
import { countItems } from "@/lib/items"

export default async function HomePage() {
  const user = await requireAdmin()
  const counts = await Promise.all(COLLECTIONS.map((c) => countItems(c.table)))
  const name = user.email.split("@")[0]

  return (
    <>
      <PageHeader crumbs={[{ label: "Home" }]} />
      <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back{name ? `, ${name}` : ""}</h1>
          <p className="text-muted-foreground">Choose what you want to add or edit.</p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COLLECTIONS.map((collection, i) => {
            const { published, drafts } = counts[i]
            return (
              <li key={collection.slug}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <collection.icon className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle>
                          <Link href={`/${collection.slug}`} className="hover:underline">
                            {collection.label}
                          </Link>
                        </CardTitle>
                        <CardDescription>{collection.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-6">
                    <Stat label="Published" value={published} />
                    <Stat label={drafts === 1 ? "Draft" : "Drafts"} value={drafts} />
                  </CardContent>
                  <CardFooter className="mt-auto gap-2 border-t pt-4">
                    <ButtonLink href={`/${collection.slug}/new`} size="sm">
                      <PlusIcon />
                      Add
                    </ButtonLink>
                    <ButtonLink href={`/${collection.slug}`} size="sm" variant="ghost">
                      View all
                      <ArrowRightIcon />
                    </ButtonLink>
                  </CardFooter>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
