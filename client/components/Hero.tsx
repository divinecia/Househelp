import { cn } from "@/lib/utils";

interface HeroProps {
  imageUrl: string;
  className?: string;
}

export default function Hero({ imageUrl, className }: HeroProps) {
  return (
    <div className={cn("w-full py-12 md:py-20 bg-white", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src={imageUrl}
            alt="Welcome to HouseHelp"
            className="w-full max-w-2xl h-auto rounded-xl shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
