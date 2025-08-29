import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI } from '../services/supabaseApi';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface DashboardStats {
  active_students: number;
  new_students: number;
  active_groups: number;
  total_teachers: number;
  revenue: number;
  total_payments: number;
  attendance_rate: number;
}

interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await dashboardAPI.getOverview();
      setStats(response.stats);
      setRecentActivities(response.recent_activities || []);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error Loading Dashboard',
        message: error.message || 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Students',
      value: stats?.active_students || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats?.new_students || 0} this month`,
    },
    {
      title: 'Active Groups',
      value: stats?.active_groups || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: 'Currently running',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-purple-500',
      change: `${stats?.total_payments || 0} payments`,
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.attendance_rate || 0}%`,
      icon: UserCheck,
      color: 'bg-orange-500',
      change: 'Last 30 days',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening at your institution today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              Logged in as {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activities</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition-colors">
              <Users className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Student</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <CreditCard className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Record Payment</p>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
              <UserCheck className="w-6 h-6 text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Take Attendance</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(stats?.attendance_rate || 0) < 70 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Low Attendance Alert</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Overall attendance rate is {stats?.attendance_rate}%. Consider reviewing attendance policies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;