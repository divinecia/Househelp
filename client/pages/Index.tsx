import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import Footer from "@/components/Footer";
import { Wrench, Home, Settings } from "lucide-react";

export default function Index() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <Hero imageUrl="https://cdn.builder.io/api/v1/image/assets%2F46cce9c9a9bb4b7ebbe482b55bfa6e69%2F66860d28170f47dc99c263416746102a?format=webp&width=800" />

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional household services platform connecting trusted workers with families
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <ServiceCard
              icon={Wrench}
              title="Worker"
              description="Join our network of professional household workers"
              bgColor="worker"
              onClick={() => handleRoleSelect("worker")}
            />
            <ServiceCard
              icon={Home}
              title="Household"
              description="Find trusted professionals for your home"
              bgColor="household"
              onClick={() => handleRoleSelect("household")}
            />
            <ServiceCard
              icon={Settings}
              title="Admin"
              description="Manage and oversee platform operations"
              bgColor="admin"
              onClick={() => handleRoleSelect("admin")}
            />
          </div>

          <div className="flex justify-center">
            <button className="px-8 py-3 border border-gray-300 rounded-lg text-foreground font-medium hover:bg-gray-50 hover:border-primary transition-all flex items-center gap-2">
              Continue as Guest
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {selectedRole && (
            <div className="mt-8 p-6 bg-primary/10 rounded-lg text-center">
              <p className="text-sm text-primary font-medium">
                You selected: <span className="font-bold capitalize">{selectedRole}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Redirecting to {selectedRole} dashboard...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
