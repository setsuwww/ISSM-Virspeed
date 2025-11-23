import { CircleCheckBig, CircleX, Info } from "lucide-react";

const typeStyles = {
  p: {
    text: "text-teal-500",
    bg: "bg-teal-100/50",
    border: "border-teal-200",
    icon: CircleCheckBig
  },
  n: {
    text: "text-rose-500",
    bg: "bg-rose-100/50",
    border: "border-rose-200",
    icon: CircleX
  },
  i: {
    text: "text-blue-500",
    bg: "bg-blue-50/50",
    border: "border-blue-200/50",
    icon: Info
  },
  w: {
    text: "text-yellow-500",
    bg: "bg-yellow-50/50",
    border: "border-yellow-200/50",
    icon: Info
  }
};

export function IconListItem({ children, type = "i" }) {
  const { text } = typeStyles[type];
  return (
    <div className={`flex items-center gap-x-2 ${text}`}>
      {children}
    </div>
  );
}

export function ContentList({ items, type = "i" }) {
  const { bg, border, text, icon: Icon } = typeStyles[type];
  return (
    <div
      className={`w-fit flex flex-col ${bg} border ${border} p-3 rounded-lg space-y-0.5`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-x-2">
          <Icon className={`${text}`} strokeWidth={1.5} size={14} />
          <span className={`text-sm ${text}`}>{item}</span>
        </div>
      ))}
    </div>
  );
}


