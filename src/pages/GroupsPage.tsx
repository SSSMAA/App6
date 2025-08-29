import React, { useState, useEffect } from 'react';
import { groupsAPI } from '../services/supabaseApi';
import { useNotifications } from '../contexts/NotificationContext';
import { Plus, Users, Clock, DollarSign } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Group {
  id: string;
  name: string;
  level: string;
  subject: string;
  teacher_name: string;
  student_count: number;
  max_students: number;
  fee_amount: number;
  status: string;
}

const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getAll();
      setGroups(response.groups);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error Loading Groups',
        message: error.message || 'Failed to load groups',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage classes and study groups</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.subject} - {group.level}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(group.status)}`}>
                  {group.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{group.student_count}/{group.max_students} students</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>${group.fee_amount}/month</span>
                </div>

                {group.teacher_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Teacher: {group.teacher_name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${(group.student_count / group.max_students) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round((group.student_count / group.max_students) * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Edit Group
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first group.</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
            Create Group
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;