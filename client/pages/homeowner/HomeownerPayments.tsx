import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPayments } from "@/lib/api-client";
import { toast } from "sonner";
import { CreditCard, CheckCircle, Clock, AlertCircle, Download } from "lucide-react";

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: "flutterwave" | "bank_transfer" | "cash";
  status: "pending" | "success" | "failed";
  transaction_ref?: string;
  description?: string;
  created_at?: string;
}

export default function HomeownerPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments(selectedStatus);
  }, [selectedStatus, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getPayments();
      if (response.success && response.data) {
        setPayments(response.data);
        filterPayments(selectedStatus);
      } else {
        toast.error("Failed to load payments");
      }
    } catch (error) {
      toast.error("Error loading payments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = (status: string) => {
    if (status === "all") {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter((p) => p.status === status));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "flutterwave":
        return "💳";
      case "bank_transfer":
        return "🏦";
      case "cash":
        return "💵";
      default:
        return "💰";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "flutterwave":
        return "Flutterwave";
      case "bank_transfer":
        return "Bank Transfer";
      case "cash":
        return "Cash Payment";
      default:
        return method;
    }
  };

  const calculateTotals = () => {
    const successful = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);

    return { successful, pending };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Payment History
            </h1>
            <p className="text-muted-foreground">
              Track and manage your payments
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {totals.successful.toLocaleString()} RWF
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payment</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {totals.pending.toLocaleString()} RWF
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {payments.length}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => navigate("/homeowner/payment")}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Make Payment
            </button>
            <button
              className="px-6 py-2 border border-gray-300 text-foreground font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {["all", "success", "pending", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Payments Table */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No payments found</p>
              <button
                onClick={() => navigate("/homeowner/payment")}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
              >
                Make Payment
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, index) => (
                      <tr
                        key={payment.id}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-foreground">
                          {payment.created_at
                            ? new Date(payment.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="flex items-center gap-2">
                            {getMethodIcon(payment.payment_method)}
                            {getMethodLabel(payment.payment_method)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                          {payment.amount.toLocaleString()} RWF
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {payment.transaction_ref
                            ? payment.transaction_ref.substring(0, 12)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            <span className="font-medium capitalize">
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="text-primary hover:underline font-medium text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Payment Details
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  {selectedPayment.amount.toLocaleString()} RWF
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="text-foreground font-medium">
                  {getMethodLabel(selectedPayment.payment_method)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-foreground font-medium capitalize">
                  {selectedPayment.status}
                </p>
              </div>

              {selectedPayment.transaction_ref && (
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="text-foreground font-mono text-sm">
                    {selectedPayment.transaction_ref}
                  </p>
                </div>
              )}

              {selectedPayment.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground">{selectedPayment.description}</p>
                </div>
              )}

              {selectedPayment.created_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-foreground">
                    {new Date(selectedPayment.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
