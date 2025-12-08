import { useState, useEffect } from "react";
import { HelpCircle, FileText, CreditCard, Shield } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  read: boolean;
}

interface Setting {
  id: string;
  name: string;
  value: boolean | string;
  type: "toggle" | "select" | "text";
  options?: string[];
}

export default function HomeownerMore() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [activeTab, setActiveTab] = useState<
    "notifications" | "settings" | "help" | "billing"
  >("notifications");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "Booking Confirmed",
          message:
            "Your booking with Alice Mukamana for Dec 7th has been confirmed",
          type: "success",
          timestamp: "2025-12-06 14:30",
          read: false,
        },
        {
          id: "2",
          title: "Payment Due",
          message: "Payment for your recent booking is due in 2 days",
          type: "warning",
          timestamp: "2025-12-06 10:00",
          read: false,
        },
        {
          id: "3",
          title: "New Worker Available",
          message: "A new highly-rated worker has joined in your area",
          type: "info",
          timestamp: "2025-12-05 16:45",
          read: true,
        },
      ];

      const mockSettings: Setting[] = [
        {
          id: "1",
          name: "Email Notifications",
          value: true,
          type: "toggle",
        },
        {
          id: "2",
          name: "SMS Notifications",
          value: false,
          type: "toggle",
        },
        {
          id: "3",
          name: "Booking Reminders",
          value: true,
          type: "toggle",
        },
        {
          id: "4",
          name: "Language",
          value: "English",
          type: "select",
          options: ["English", "Kinyarwanda", "French"],
        },
        {
          id: "5",
          name: "Default Service Area (km)",
          value: "5",
          type: "text",
        },
      ];

      setNotifications(mockNotifications);
      setSettings(mockSettings);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const updateSetting = (id: string, value: boolean | string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, value } : setting,
      ),
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "9";
      case "warning":
        return "�";
      case "success":
        return "";
      case "error":
        return "L";
      default:
        return "=�";
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">More</h2>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Notifications{" "}
            {getUnreadCount() > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {getUnreadCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "billing"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Billing
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "help"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Help & Support
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Notifications
              </h3>
              {getUnreadCount() > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.read
                        ? "bg-white border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-500"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>

            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{setting.name}</h4>
                  {setting.type === "toggle" && (
                    <button
                      onClick={() => updateSetting(setting.id, !setting.value)}
                      className={`mt-2 relative inline-flex h-6 w-11 items-center rounded-full ${
                        setting.value ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          setting.value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}
                  {setting.type === "select" && (
                    <select
                      value={setting.value as string}
                      onChange={(e) =>
                        updateSetting(setting.id, e.target.value)
                      }
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {setting.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {setting.type === "text" && (
                    <input
                      type="text"
                      value={setting.value as string}
                      onChange={(e) =>
                        updateSetting(setting.id, e.target.value)
                      }
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Billing & Payments
            </h3>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <CreditCard size={24} className="text-blue-600 mr-3" />
                <h4 className="font-medium text-gray-900">Payment Methods</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">Mobile Money</p>
                    <p className="text-sm text-gray-600">+250 788 111 222</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Primary
                  </span>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Add Payment Method
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <FileText size={24} className="text-blue-600 mr-3" />
                <h4 className="font-medium text-gray-900">Payment History</h4>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">
                      House Cleaning - Alice Mukamana
                    </p>
                    <p className="text-sm text-gray-600">Dec 5, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">RWF 25,000</p>
                    <span className="text-xs text-green-600">Paid</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">
                      Garden Service - Jean Baptiste
                    </p>
                    <p className="text-sm text-gray-600">Dec 3, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">RWF 30,000</p>
                    <span className="text-xs text-green-600">Paid</span>
                  </div>
                </div>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-500 text-sm">
                View All Transactions
              </button>
            </div>
          </div>
        )}

        {activeTab === "help" && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Help & Support
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <HelpCircle size={20} className="text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">
                    Frequently Asked Questions
                  </h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600 ml-7">
                  <p>" How do I book a worker?</p>
                  <p>" How do I cancel a booking?</p>
                  <p>" What are the payment methods available?</p>
                  <p>" How do I rate a worker?</p>
                  <p>" What if I'm not satisfied with the service?</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Shield size={20} className="text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">
                    Safety & Security
                  </h4>
                </div>
                <div className="space-y-2 text-sm text-gray-600 ml-7">
                  <p>" All workers are background-checked</p>
                  <p>" Secure payment processing</p>
                  <p>" 24/7 customer support</p>
                  <p>" Insurance coverage available</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Contact Support
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>=� Email: support@househelp.rw</p>
                  <p>=� Phone: +250 788 123 456</p>
                  <p>=� WhatsApp: +250 788 123 456</p>
                  <p>=R Support Hours: Mon-Fri 8AM-6PM, Sat 9AM-1PM</p>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Submit Support Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
