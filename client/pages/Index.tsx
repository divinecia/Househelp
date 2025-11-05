import { useState } from "react";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";
import { Wrench, Home, Settings } from "lucide-react";

export default function Index() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Home Section */}
      <main id="home" className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-foreground">HOUSE</span>
              <span className="text-primary">HELP</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professional household services platform connecting trusted workers with families
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <ServiceCard
              icon={Wrench}
              title="Worker"
              bgColor="worker"
              onClick={() => handleRoleSelect("worker")}
            />
            <ServiceCard
              icon={Home}
              title="Household"
              bgColor="household"
              onClick={() => handleRoleSelect("household")}
            />
            <ServiceCard
              icon={Settings}
              title="Admin"
              bgColor="admin"
              onClick={() => handleRoleSelect("admin")}
            />
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button className="px-8 py-3 border-2 border-gray-300 rounded-lg text-foreground font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2 text-base">
              Continue as Guest
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Selection Feedback */}
          {selectedRole && (
            <div className="mt-8 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 text-center">
              <p className="text-base text-primary font-semibold">
                You selected: <span className="font-bold capitalize text-primary text-lg">{selectedRole}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                Preparing {selectedRole} dashboard...
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Services Section */}
      <ServicesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
