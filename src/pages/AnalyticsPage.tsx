import React, { useState, useEffect } from 'react';
import { dashboardAPI, aiAPI } from '../services/supabaseApi';
import { useNotifications } from '../contexts/NotificationContext';
import { BarChart3, TrendingUp, Users, AlertTriangle, Brain } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface AtRiskStudent {
  id: string;
  name: string;
  group_name: string;
  attended_sessions: number;
  total_sessions: number;
  ai_analysis: string;
}

const AnalyticsPage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [topGroups, setTopGroups] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [revenueResponse, trendsResponse, groupsResponse] = await Promise.all([
        dashboardAPI.getRevenue('month'),
        dashboardAPI.getEnrollmentTrends(),
        dashboardAPI.getTopGroups(),
      ]);

      setRevenueData(revenueResponse.revenue_data);
      setEnrollmentTrends(trendsResponse.enrollment_trends);
      setTopGroups(groupsResponse.top_groups);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error Loading Analytics',
        message: error.message || 'Failed to load analytics data',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAtRiskStudents = async () => {
    try {
      setAiLoading(true);
      const response = await aiAPI.predictAtRiskStudents();
      setAtRiskStudents(response.atRiskStudents);
      
      addNotification({
        type: 'success',
        title: 'AI Analysis Complete',
        message: `Found ${response.atRiskStudents.length} students at risk of dropping out.`,
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'AI Analysis Failed',
        message: error.message || 'Failed to analyze at-risk students',
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights and performance metrics</p>
        </div>
        <button
          onClick={loadAtRiskStudents}
          disabled={aiLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          {aiLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          <span>{aiLoading ? 'Analyzing...' : 'AI Risk Analysis'}</span>
        </button>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
        </div>
        
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Revenue chart visualization</p>
            <p className="text-sm text-gray-500">
              {revenueData.length} data points available
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Groups */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Groups</h3>
        </div>

        <div className="space-y-4">
          {topGroups.map((group, index) => (
            <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-indigo-600">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-sm text-gray-600">{group.level} - {group.teacher_name}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{group.student_count}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-600">{group.attendance_rate}%</p>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At-Risk Students */}
      {atRiskStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Students at Risk</h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {atRiskStudents.length} students
            </span>
          </div>

          <div className="space-y-4">
            {atRiskStudents.map((student) => (
              <div key={student.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.group_name}</p>
                    <p className="text-sm text-red-600 mt-1">
                      Attendance: {student.attended_sessions}/{student.total_sessions} sessions
                      ({Math.round((student.attended_sessions / student.total_sessions) * 100)}%)
                    </p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors">
                    Take Action
                  </button>
                </div>
                
                {student.ai_analysis && (
                  <div className="mt-3 p-3 bg-white rounded-md border border-red-200">
                    <p className="text-sm text-gray-700">{student.ai_analysis}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Enrollment Trends</h3>
        </div>
        
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Enrollment trends visualization</p>
            <p className="text-sm text-gray-500">
              {enrollmentTrends.length} months of data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;