import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  GraduationCap,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'director', 'head_trainer', 'teacher', 'agent', 'marketer'] },
    { name: 'Students', href: '/students', icon: Users, roles: ['admin', 'director', 'head_trainer', 'teacher', 'agent'] },
    { name: 'Groups', href: '/groups', icon: GraduationCap, roles: ['admin', 'director', 'head_trainer', 'teacher'] },
    { name: 'Attendance', href: '/attendance', icon: UserCheck, roles: ['admin', 'director', 'head_trainer', 'teacher'] },
    { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin', 'director', 'agent'] },
    { name: 'Marketing', href: '/marketing', icon: TrendingUp, roles: ['admin', 'director', 'marketer'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'director', 'head_trainer'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'director'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ISCHOOLGO</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 transition-colors
                    ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;