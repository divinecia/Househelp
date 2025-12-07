import { useState, useEffect } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

interface Setting {
  id: string;
  name: string;
  value: boolean | string;
  type: 'toggle' | 'select' | 'text';
  options?: string[];
}

export default function WorkerMore() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'help'>('notifications');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Task Assigned',
          message: 'You have been assigned to clean a house in Kigali',
          type: 'info',
          timestamp: '2024-01-15 10:30',
          read: false
        },
        {
          id: '2',
          title: 'Training Reminder',
          message: 'Complete your safety training module by tomorrow',
          type: 'warning',
          timestamp: '2024-01-14 15:45',
          read: false
        },
        {
          id: '3',
          title: 'Payment Received',
          message: 'Your payment for last week\'s work has been processed',
          type: 'success',
          timestamp: '2024-01-13 09:00',
          read: true
        }
      ];

      // Mock data for settings
      const mockSettings: Setting[] = [
        {
          id: '1',
          name: 'Email Notifications',
          value: true,
          type: 'toggle'
        },
        {
          id: '2',
          name: 'SMS Notifications',
          value: false,
          type: 'toggle'
        },
        {
          id: '3',
          name: 'Language',
          value: 'English',
          type: 'select',
          options: ['English', 'Kinyarwanda', 'French']
        },
        {
          id: '4',
          name: 'Work Radius (km)',
          value: '10',
          type: 'text'
        }
      ];

      setNotifications(mockNotifications);
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const updateSetting = (id: string, value: boolean | string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
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
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications {getUnreadCount() > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {getUnreadCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'help'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Help & Support
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
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
                        ? 'bg-white border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
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

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            
            {settings.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{setting.name}</h4>
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => updateSetting(setting.id, !setting.value)}
                      className={`mt-2 relative inline-flex h-6 w-11 items-center rounded-full ${
                        setting.value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          setting.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                  {setting.type === 'select' && (
                    <select
                      value={setting.value as string}
                      onChange={(e) => updateSetting(setting.id, e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {setting.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={setting.value as string}
                      onChange={(e) => updateSetting(setting.id, e.target.value)}
                      className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Help & Support</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Frequently Asked Questions</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• How do I update my availability?</p>
                  <p>• How do I request time off?</p>
                  <p>• How do I change my service area?</p>
                  <p>• How do I update my skills and certifications?</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 Email: support@househelp.rw</p>
                  <p>📞 Phone: +250 788 123 456</p>
                  <p>💬 WhatsApp: +250 788 123 456</p>
                  <p>🕒 Support Hours: Mon-Fri 8AM-5PM</p>
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