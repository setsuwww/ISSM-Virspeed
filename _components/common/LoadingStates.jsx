import { Loader } from 'lucide-react';

export default function LoadingStates() {
  return (
      <div className="min-h-screen flex items-center justify-center bg-radial from-sky-50 to-white">
        <Loader className="w-20 h-20 text-sky-500 animate-spin" strokeWidth={1.5} />
      </div>
    )
}
