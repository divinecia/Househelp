import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import ServiceCard from "@/components/ServiceCard";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";
import { Wrench, Home, Settings } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate(`/${role}/register`);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
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

        </div>
      </main>

      {/* Services Section */}
      <ServicesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
