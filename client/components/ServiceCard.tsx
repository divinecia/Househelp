import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  bgColor: keyof typeof bgColors;
  onClick?: () => void;
  className?: string;
}

const bgColors = {
  worker: "bg-gradient-to-br from-blue-900 to-blue-700",
  household: "bg-gradient-to-br from-blue-500 to-blue-400",
  admin: "bg-gradient-to-br from-gray-500 to-gray-400",
};

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  bgColor,
  onClick,
  className,
}: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-8 min-h-[200px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95",
        bgColors[bgColor],
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
          <Icon size={48} className="text-white" strokeWidth={1.5} />
        </div>
        <h3 className="text-white font-bold text-2xl">{title}</h3>
        {description && (
          <p className="text-white/80 text-sm text-center">{description}</p>
        )}
      </div>
    </button>
  );
}
