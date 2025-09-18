import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AudioPlayButton } from '../components/ui/AudioPlayButton';
import { useChat } from '../hooks/useChat';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { ttsAPI } from '@/services/api';
import { useSearchParams } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  
  // 从URL参数获取对话ID
  const conversationId = searchParams.get('conversation');
  const conversationIdNumber = conversationId ? parseInt(conversationId, 10) : undefined;
  
  const {
    messages,
    currentConversationId,
    sendMessage,
    createNewConversation,
    isLoadingHistory,
  } = useChat(conversationIdNumber, true); // 启用自动加载最新对话

  const { scrollToBottom } = useAutoScroll(messagesEndRef);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      await sendMessage(message); //调用sendMessage函数发送消息
    } catch (error) {
      console.error('发送消息失败:', error);
      // 可以添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    createNewConversation();
  };

  const handlePlayTTS = async (text: string, messageId: string) => {
    try {
      setPlayingAudio(messageId);
      const response = await ttsAPI.generateTTS({
        text: text,
        audio_prompt: 'default',
        emo_audio_prompt: 'default',
        output_path: 'default'
      });
      
      if (response.success && response.audio_url) {
        const audio = new Audio(response.audio_url);
        audio.onended = () => setPlayingAudio(null);
        audio.onerror = () => {
          setPlayingAudio(null);
          throw new Error('音频播放失败');
        };
        await audio.play();
      } else {
        throw new Error('TTS生成失败');
      }
    } catch (error) {
      console.error('TTS播放失败:', error);
      setPlayingAudio(null);
      throw error; // 重新抛出错误，让AudioPlayButton处理
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold text-gray-900">AI 智能助手</h1>
            {currentConversationId && (
              <span className="text-sm text-gray-500">
                对话 #{currentConversationId}
              </span>
            )}
          </div>
          <Button 
            onClick={handleNewChat}
            variant="outline"
            size="sm"
          >
            新对话
          </Button>
        </div>
      </div>

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {isLoadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">
                {conversationIdNumber ? '正在加载历史消息...' : '正在加载最新对话...'}
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">👋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                欢迎使用 AI 智能助手
              </h3>
              <p className="text-gray-500">
                开始一个新的对话，我会尽力帮助您！
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm border'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                  {message.role === 'assistant' && (
                    <div className="mt-2 flex justify-end">
                      <AudioPlayButton
                        text={message.content}
                        messageId={message.id.toString()}
                        isPlaying={playingAudio === message.id.toString()}
                        onPlay={handlePlayTTS}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-sm border px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>AI 正在思考...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的消息..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6"
            >
              {isLoading ? '发送中...' : '发送'}
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
