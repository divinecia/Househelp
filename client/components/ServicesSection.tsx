import { useState, useEffect } from "react";
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
import { apiGet } from "../lib/api-client";

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  workers: number;
  description?: string;
}

const serviceIconMap: Record<string, React.ReactNode> = {
  cooking: <ChefHat size={32} />,
  washing: <Droplet size={32} />,
  cleaning: <Sparkles size={32} />,
  gardening: <Leaf size={32} />,
  elderly: <Users size={32} />,
  pet: <PawPrint size={32} />,
  child: <Baby size={32} />,
  laundry: <Shirt size={32} />,
};

const defaultServices: Service[] = [
  {
    id: "cooking",
    name: "Cooking",
    icon: serviceIconMap.cooking,
    workers: 248,
  },
  {
    id: "washing",
    name: "Washing",
    icon: serviceIconMap.washing,
    workers: 156,
  },
  {
    id: "cleaning",
    name: "Cleaning",
    icon: serviceIconMap.cleaning,
    workers: 312,
  },
  {
    id: "gardening",
    name: "Gardening",
    icon: serviceIconMap.gardening,
    workers: 89,
  },
  {
    id: "elderlycare",
    name: "Elderly Care",
    icon: serviceIconMap.elderly,
    workers: 124,
  },
  {
    id: "petcare",
    name: "Pet Care",
    icon: serviceIconMap.pet,
    workers: 67,
  },
  {
    id: "childcare",
    name: "Child Care",
    icon: serviceIconMap.child,
    workers: 201,
  },
  {
    id: "laundry",
    name: "Laundry & Ironing",
    icon: serviceIconMap.laundry,
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
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="text-white text-4xl font-bold">{service.workers}</div>
          <div className="text-white/90 text-sm font-medium">
            workers available
          </div>
        </div>
      </div>
    </div>
  );
}

interface ServicesSectionProps {
  className?: string;
}

export default function ServicesSection({ className }: ServicesSectionProps) {
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await apiGet("/services");

        if (response.success && response.data && Array.isArray(response.data)) {
          const fetchedServices: Service[] = response.data.map(
            (service: {
              id: string;
              name: string;
              workers?: number;
              description?: string;
            }) => {
              const serviceNameLower = service.name.toLowerCase();
              let icon = serviceIconMap.cleaning;

              if (serviceNameLower.includes("cook"))
                icon = serviceIconMap.cooking;
              else if (serviceNameLower.includes("wash"))
                icon = serviceIconMap.washing;
              else if (serviceNameLower.includes("clean"))
                icon = serviceIconMap.cleaning;
              else if (serviceNameLower.includes("garden"))
                icon = serviceIconMap.gardening;
              else if (serviceNameLower.includes("elderly"))
                icon = serviceIconMap.elderly;
              else if (serviceNameLower.includes("pet"))
                icon = serviceIconMap.pet;
              else if (serviceNameLower.includes("child"))
                icon = serviceIconMap.child;
              else if (serviceNameLower.includes("laundry"))
                icon = serviceIconMap.laundry;

              return {
                id: service.id,
                name: service.name,
                icon,
                workers: service.workers || 0,
                description: service.description,
              };
            },
          );

          setServices(fetchedServices);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
        // Keep default services on error, no need to change state
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section
      id="services"
      className={cn(
        "py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our range of professional household services. Hover over
            each service to see how many qualified workers are available.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-8 h-48 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
