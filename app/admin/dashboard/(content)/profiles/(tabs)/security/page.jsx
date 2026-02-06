import { Card, CardContent, CardHeader } from "@/_components/ui/Card"

export default function SecurityPage() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Security</h2>
      </CardHeader>
      <CardContent className="text-sm text-slate-600">
        <p>Password, session, dan pengaturan keamanan akan tersedia di sini.</p>
      </CardContent>
    </Card>
  )
}
