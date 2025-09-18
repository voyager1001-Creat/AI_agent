import React from 'react';
import { Button } from './Button';

interface SystemPromptCardProps {
  id: number;
  name: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  onActivate: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const SystemPromptCard: React.FC<SystemPromptCardProps> = ({
  id,
  name,
  content,
  isActive,
  createdAt,
  onActivate,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isActive 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : 'border-gray-200 bg-white hover:shadow-sm'
    }`}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium text-gray-900">{name}</h3>
            {isActive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                已激活
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            创建于 {formatDate(createdAt)}
          </p>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex space-x-2 ml-4">
          {!isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActivate(id)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              激活
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(id)}
            >
              编辑
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(id)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              删除
            </Button>
          )}
        </div>
      </div>

      {/* 内容预览 */}
      <div className="bg-gray-50 rounded-md p-3 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {truncateContent(content)}
        </p>
      </div>

      {/* 状态指示器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          }`}></div>
          <span className="text-xs text-gray-500">
            {isActive ? '当前使用中' : '未激活'}
          </span>
        </div>
        
        <div className="text-xs text-gray-400">
          ID: {id}
        </div>
      </div>
    </div>
  );
};
