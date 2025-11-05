import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={cn("bg-white border-b border-gray-100 sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="font-bold text-2xl hover:opacity-80 transition"
          >
            <span className="text-foreground">HOUSE</span>
            <span className="text-primary">HELP</span>
          </button>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              onClick={(e) => handleScroll(e, "home")}
              className="text-foreground hover:text-primary transition font-medium"
            >
              Home
            </a>
            <a
              href="#services"
              onClick={(e) => handleScroll(e, "services")}
              className="text-foreground hover:text-primary transition font-medium"
            >
              Services
            </a>
            <a
              href="#footer"
              onClick={(e) => handleScroll(e, "footer")}
              className="text-foreground hover:text-primary transition font-medium"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
