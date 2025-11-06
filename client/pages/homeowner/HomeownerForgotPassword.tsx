import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomeownerForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setMessage("If an account exists with this email, you will receive a reset link.");
    setStep("reset");
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setMessage("Password reset successful! Redirecting to login...");
    setTimeout(() => navigate("/homeowner/login"), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-16 bg-gradient-to-b from-white via-white to-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground">
              Recover your homeowner account access
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/homeowner/login")}
                  className="w-full px-6 py-3 text-primary font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm">
                    {message}
                  </div>
                )}

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Reset Password
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/homeowner/login")}
                  className="w-full px-6 py-3 text-primary font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
