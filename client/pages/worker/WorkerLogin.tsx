import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { loginUser } from "@/lib/auth";

export default function WorkerLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const user = loginUser("worker", formData.email, formData.password);
    if (user) {
      navigate("/worker/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Worker Login
            </h1>
            <p className="text-muted-foreground">
              Sign in to your worker account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-8">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors mb-4"
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => navigate("/worker/register")}
              className="w-full px-6 py-3 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create New Account
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/worker/forgot-password")}
                className="flex-1 px-6 py-3 text-primary font-semibold hover:underline"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 px-6 py-3 text-primary font-semibold hover:underline"
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
