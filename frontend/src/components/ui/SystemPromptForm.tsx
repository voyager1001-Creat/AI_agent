import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface SystemPromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; content: string; isActive: boolean }) => Promise<void>;
  initialData?: {
    id?: number;
    name: string;
    content: string;
    isActive: boolean;
  };
  title: string;
  loading?: boolean;
}

export const SystemPromptForm: React.FC<SystemPromptFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isActive: false
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 当初始数据变化时更新表单
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        content: initialData.content || '',
        isActive: initialData.isActive || false
      });
    } else {
      setFormData({
        name: '',
        content: '',
        isActive: false
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入系统提示词名称';
    }

    if (!formData.content.trim()) {
      newErrors.content = '请输入系统提示词内容';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 名称输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            系统提示词名称 <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="请输入系统提示词名称"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* 内容输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            系统提示词内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={6}
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="请输入系统提示词内容..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* 激活选项 */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            激活此系统提示词
          </label>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </div>
  );
};
