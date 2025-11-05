import { useState } from "react";
import {
  ChefHat,
  Droplet,
  Sparkles,
  Leaf,
  Users,
  PawPrint,
  Baby,
  Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  workers: number;
}

const services: Service[] = [
  {
    id: "cooking",
    name: "Cooking",
    icon: <ChefHat size={32} />,
    workers: 248,
  },
  {
    id: "washing",
    name: "Washing",
    icon: <Droplet size={32} />,
    workers: 156,
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: <Sparkles size={32} />,
    workers: 312,
  },
  {
    id: "gardening",
    name: "Gardening",
    icon: <Leaf size={32} />,
    workers: 89,
  },
  {
    id: "elderlycare",
    name: "Elderly Care",
    icon: <Users size={32} />,
    workers: 124,
  },
  {
    id: "petcare",
    name: "Pet Care",
    icon: <PawPrint size={32} />,
    workers: 67,
  },
  {
    id: "childcare",
    name: "Child Care",
    icon: <Baby size={32} />,
    workers: 201,
  },
  {
    id: "laundry",
    name: "Laundry & Ironing",
    icon: <Shirt size={32} />,
    workers: 178,
  },
];

interface ServiceItemProps {
  service: Service;
}

function ServiceItem({ service }: ServiceItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px] transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer">
        <div className="text-primary transition-transform duration-300 group-hover:scale-110">
          {service.icon}
        </div>
        <h3 className="font-semibold text-center text-foreground text-base">
          {service.name}
        </h3>

        {/* Worker count - appears on hover */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/80 rounded-xl flex flex-col items-center justify-center gap-3 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="text-white text-4xl font-bold">{service.workers}</div>
          <div className="text-white/90 text-sm font-medium">workers available</div>
        </div>
      </div>
    </div>
  );
}

interface ServicesSectionProps {
  className?: string;
}

export default function ServicesSection({ className }: ServicesSectionProps) {
  return (
    <section
      id="services"
      className={cn(
        "py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our range of professional household services. Hover over each service to see how many qualified workers are available.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceItem key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
