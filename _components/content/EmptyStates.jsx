import Link from "next/link"
import { Button } from "@/_components/ui/Button"
import { Inbox } from "lucide-react"

export default function EmptyStates({
  message = "There's nothing here, create something new",
  href,
  actionText = "Add new",
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="p-4 bg-slate-100 rounded-full mb-4">
        <Icon className="w-10 h-10 text-slate-700" />
      </div>
      <h3 className="text-base font-medium text-slate-500 mb-2">{message}</h3>

      {href && (
        <Link href={href}>
          <Button size="sm" variant="outline" className="mt-2">
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  )
}
