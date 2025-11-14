import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserRound, Home, Settings, Zap, Users, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate(`/${role}/register`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-foreground">HOUSE</span>
              <span className="text-primary">HELP</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Professional household services platform connecting trusted workers with families
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
            {/* Worker Card */}
            <div
              onClick={() => handleRoleSelect("worker")}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <UserRound size={40} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Worker</h3>
              <p className="text-muted-foreground mb-4">Join as a skilled professional and find work opportunities</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Get Started
              </button>
            </div>

            {/* Homeowner Card */}
            <div
              onClick={() => handleRoleSelect("homeowner")}
              className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <Home size={40} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Homeowner</h3>
              <p className="text-muted-foreground mb-4">Post jobs and hire trusted household service workers</p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                Get Started
              </button>
            </div>

            {/* Admin Card */}
            <div
              onClick={() => handleRoleSelect("admin")}
              className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-8 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <Settings size={40} className="text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Admin</h3>
              <p className="text-muted-foreground mb-4">Manage platform users, trainings, and services</p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Get Started
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24 border-t border-gray-200 pt-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose HouseHelp?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Fast & Easy</h3>
                <p className="text-muted-foreground">Quick registration and immediate access to job opportunities</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Trusted Network</h3>
                <p className="text-muted-foreground">Verified workers and homeowners with safe transactions</p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Secure & Safe</h3>
                <p className="text-muted-foreground">Secure payments, ratings, and user protection policies</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
