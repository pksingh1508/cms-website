import { ArrowLeftIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { ButtonLink } from "@/components/button-link"

/** The 404 message, shared by the CMS and the root not-found page. */
export function NotFoundPanel({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex max-w-md flex-col items-center gap-5 text-center"
    >
      <p aria-hidden className="text-gradient-brand text-8xl leading-none font-black tracking-tighter select-none">
        404
      </p>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ButtonLink href="/">
        <ArrowLeftIcon />
        Go to the home page
      </ButtonLink>
    </motion.div>
  )
}
