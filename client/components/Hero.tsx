import { cn } from "@/lib/utils";

interface HeroProps {
  imageUrl: string;
  altText?: string;
  className?: string;
}

export default function Hero({
  imageUrl,
  altText = "Welcome to HouseHelp",
  className,
}: HeroProps) {
  return (
    <div className={cn("w-full py-12 md:py-20 bg-white", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <img
            src={imageUrl}
            alt={altText}
            className="w-full max-w-2xl h-auto rounded-xl shadow-lg"
            loading="lazy"
            onError={(e) => {
              console.error("Failed to load hero image:", imageUrl);
              e.currentTarget.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE2MFYxNDBIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE2MCA5NUgxNzVWMTEwSDE2MFY5NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE4NSAxMjVIMjAwVjE0MEgxODVWMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjAwIDk1SDE4NVYxMTBIMjAwVjk1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjAwIDE1NUgxODVWMTcwSDIwMFYxNTVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNjAgMTU1SDE3NVYxNzBIMTYwVjE1NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTIyNSAxMjVIMjEwVjE0MEgyMjVWMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjEwIDk1SDIyNVYxMTBIMjEwVjk1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjI1IDE1NUgyMTBWMTcwSDIyNVYxNTVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDE0MFYxNDBIMTI1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE0MCA5NUgxMjVWMTEwSDE0MFY5NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTEyNSAxNTVIMTQwVjE3MEgxMjVWMTU1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
            }}
          />
        </div>
      </div>
    </div>
  );
}
