import { Mail, Instagram, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className={cn("bg-gray-50 border-t border-gray-200", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="font-bold text-xl">
              <span className="text-foreground">HOUSE</span>
              <span className="text-primary">HELP</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Making Your Home Better
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-primary transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-primary transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Navigation</h3>
            <nav className="flex flex-col gap-2">
              <a
                href="#home"
                className="text-muted-foreground hover:text-primary text-sm transition"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-muted-foreground hover:text-primary text-sm transition"
              >
                Services
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-primary text-sm transition"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Get in Touch */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Get in Touch</h3>
            <a
              href="mailto:hello@househelprw.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition"
            >
              <Mail size={18} />
              hello@househelprw.com
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} HOUSEHELP. Professional household services
            platform.
          </p>
          <div className="flex gap-4">
            <a
              href="#terms"
              className="text-muted-foreground hover:text-primary text-sm transition"
            >
              Terms of Service
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="#privacy"
              className="text-muted-foreground hover:text-primary text-sm transition"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
