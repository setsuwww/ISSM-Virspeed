import Image from "next/image"

export default function ForbiddenPage() {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4 text-center">

      <Image
        src="/images/forbidden.jpg"
        alt="Access Forbidden"
        width={150} height={150}
        className="mb-6 rounded-full"
      />

      <h1 className="text-5xl font-extrabold text-red-600">403</h1>

      <p className="mt-2 text-lg font-semibold text-gray-700">Access Forbidden</p>
      <p className="mt-2 text-gray-500">You do not have permission to view this page.</p>
    </div>
  )
}
