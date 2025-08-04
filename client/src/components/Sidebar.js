import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
  Share2,
  Settings,
  Users,
  Hash,
  Image,
  MessageSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and insights'
    },
    {
      name: 'Posts',
      path: '/posts',
      icon: FileText,
      description: 'Manage your content'
    },
    {
      name: 'Schedule',
      path: '/schedule',
      icon: Calendar,
      description: 'Plan your posts'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      name: 'Platforms',
      path: '/platforms',
      icon: Share2,
      description: 'Connected accounts'
    },
    {
      name: 'Media Library',
      path: '/media',
      icon: Image,
      description: 'Images and videos'
    },
    {
      name: 'Hashtags',
      path: '/hashtags',
      icon: Hash,
      description: 'Hashtag research'
    },
    {
      name: 'Comments',
      path: '/comments',
      icon: MessageSquare,
      description: 'Manage interactions'
    },
    {
      name: 'Team',
      path: '/team',
      icon: Users,
      description: 'Collaborate with others'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      description: 'App preferences'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar content */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      active
                        ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                  Social Manager Pro
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  v1.0.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="w-64"></div>
      </div>
    </>
  );
};

export default Sidebar;