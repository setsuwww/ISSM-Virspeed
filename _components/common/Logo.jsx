import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="p-1 bg-gradient-to-br from-gray-950 to-gray-700 rounded-md">
        <Image src="/icons/liveon.png" width={30} height={30} alt="Liveon icon" />
      </div>
      <div className="text-xl font-bold text-yellow-500">Bee<span className="text-gray-800">fast.</span></div>
    </div>
  )
}