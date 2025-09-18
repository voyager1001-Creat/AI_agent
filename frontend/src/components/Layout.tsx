import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/chat', label: '聊天', icon: '💬' },
    { path: '/conversations', label: '历史', icon: '📚' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边导航栏 */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b">
            <div className="text-2xl font-bold text-blue-600">AI Agent</div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 底部信息 */}
          <div className="px-4 py-4 border-t">
            <div className="text-xs text-gray-500 text-center">
              <div>AI Agent v1.0.0</div>
              <div className="mt-1">Powered by FastAPI</div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
};

export default Layout;
