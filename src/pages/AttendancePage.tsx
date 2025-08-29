import React, { useState, useEffect } from 'react';
import { attendanceAPI, groupsAPI } from '../services/supabaseApi';
import { useNotifications } from '../contexts/NotificationContext';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface AttendanceRecord {
  id: string;
  student_name: string;
  student_email: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

interface Group {
  id: string;
  name: string;
  level: string;
  subject: string;
}

const AttendancePage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup && selectedDate) {
      loadAttendance();
    }
  }, [selectedGroup, selectedDate]);

  const loadGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.groups);
      if (response.groups.length > 0) {
        setSelectedGroup(response.groups[0].id);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error Loading Groups',
        message: error.message || 'Failed to load groups',
      });
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getByGroupAndDate(selectedGroup, selectedDate);
      setAttendance(response.attendance);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error Loading Attendance',
        message: error.message || 'Failed to load attendance data',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (studentId: string, status: string) => {
    try {
      await attendanceAPI.record({
        student_id: studentId,
        group_id: selectedGroup,
        date: selectedDate,
        status,
      });
      
      // Update local state
      setAttendance(prev => 
        prev.map(record => 
          record.id === studentId ? { ...record, status: status as any } : record
        )
      );

      addNotification({
        type: 'success',
        title: 'Attendance Updated',
        message: 'Student attendance has been recorded successfully.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Error Recording Attendance',
        message: error.message || 'Failed to record attendance',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'excused':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Track and manage student attendance</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {selectedGroup && selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Attendance for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{groups.find(g => g.id === selectedGroup)?.name}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="p-6">
              {attendance.length > 0 ? (
                <div className="space-y-4">
                  {attendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {record.student_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{record.student_name}</p>
                          <p className="text-sm text-gray-600">{record.student_email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>

                        <div className="flex space-x-1">
                          {['present', 'absent', 'late', 'excused'].map((status) => (
                            <button
                              key={status}
                              onClick={() => updateAttendance(record.id, status)}
                              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                record.status === status
                                  ? getStatusColor(status)
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-600">No students are enrolled in this group yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;