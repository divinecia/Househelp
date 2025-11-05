import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  return (
    <header className={cn("bg-white border-b border-gray-100 sticky top-0 z-50", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-2xl">
              <span className="text-foreground">HOUSE</span>
              <span className="text-primary">HELP</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-foreground hover:text-primary transition">Services</a>
            <a href="#about" className="text-foreground hover:text-primary transition">About</a>
            <a href="#contact" className="text-foreground hover:text-primary transition">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
