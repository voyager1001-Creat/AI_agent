import React, { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { ConversationResponse } from '../types/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations(1); // 假设用户ID为1
      setConversations(response);
    } catch (error) {
      console.error('加载对话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (!window.confirm('确定要删除这个对话吗？')) return;

    try {
      await chatAPI.deleteConversation(conversationId.toString());
      setConversations(prev => 
        prev.filter(conv => conv.id !== conversationId)
      );
    } catch (error) {
      console.error('删除对话失败:', error);
      alert('删除对话失败，请重试');
    }
  };

  const handleExportConversation = async (conversationId: number) => {
    try {
      const response = await chatAPI.exportConversation(conversationId.toString(), 'json');
      
      // 创建下载链接
      const blob = new Blob([response.content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversationId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出对话失败:', error);
      alert('导出对话失败，请重试');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '今天';
    } else if (diffDays === 2) {
      return '昨天';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">对话历史</h1>
            <Button 
              onClick={() => navigate('/chat')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              新对话
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 搜索栏 */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* 对话列表 */}
        {filteredConversations.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? '没有找到匹配的对话' : '还没有对话记录'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? '尝试使用不同的关键词搜索' 
                : '开始您的第一个对话吧！'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/chat')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                开始对话
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredConversations.map((conversation) => (
              <Card key={conversation.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
                    {conversation.title}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/chat?conversation=${conversation.id}`)}
                    >
                      打开
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>消息数量:</span>
                    <span className="font-medium">{conversation.message_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>创建时间:</span>
                    <span>{formatDate(conversation.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>更新时间:</span>
                    <span>{formatDate(conversation.updated_at)}</span>
                  </div>
                </div>

                {conversation.system_prompt && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 truncate">
                      系统提示: {conversation.system_prompt}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportConversation(conversation.id)}
                    className="flex-1"
                  >
                    导出
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="flex-1 text-red-600 hover:text-red-700"
                  >
                    删除
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
