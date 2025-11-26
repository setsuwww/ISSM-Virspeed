import Link from "next/link"
import { Button } from "@/_components/ui/Button"
import { Inbox } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EmptyStates({
  message = "There's nothing here create something new",
  href,
  actionText = "Add new",
  icon: Icon = Inbox,
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
      <div className="p-4 border border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>

      <h3 className="max-w-xs text-base font-medium text-slate-400 text-center leading-relaxed">
        {message}
      </h3>

      <Button size="sm" variant="outline" onClick={() => router.push("/admin/dashboard")}>
        Back to Dashboard
      </Button>

      {href && (
        <Link href={href}>
          <Button size="sm" variant="outline">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  )
}
