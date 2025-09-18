import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types/api';
import { chatAPI } from '../services/api';

export const useChat = (conversationId?: number, autoLoadLatest: boolean = false) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(conversationId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // 添加用户消息到本地状态
    const userMessage: ChatMessage = {
      id: Date.now(),
      conversation_id: currentConversationId || 1,
      role: 'user',
      content: content.trim(),
      content_type: 'text',
      created_at: new Date().toISOString()
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 发送消息到后端
      const response = await chatAPI.sendMessage(content);
      
      // 添加AI回复到本地状态
      const assistantMessage: ChatMessage = {
        id: response.message_id || Date.now() + 1,
        conversation_id: response.conversation_id || currentConversationId || 1,
        role: 'assistant',
        content: response.message,
        content_type: 'text',
        created_at: new Date().toISOString()
      };

      setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);
      
      // 更新当前对话ID
      if (response.conversation_id) {
        setCurrentConversationId(response.conversation_id);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        conversation_id: currentConversationId || 1,
        role: 'assistant',
        content: '抱歉，发送消息时出现错误，请稍后重试。',
        content_type: 'text',
        created_at: new Date().toISOString()
      };
      
      setMessages((prev: ChatMessage[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId]);

  const createNewConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  const loadConversationHistory = useCallback(async (conversationId: number) => {
    if (!conversationId) return;
    
    setIsLoadingHistory(true);
    try {
      const response = await chatAPI.getChatHistory(50, conversationId);
      if (response && Array.isArray(response)) {
        const formattedMessages: ChatMessage[] = response.map((msg: any) => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          role: msg.role,
          content: msg.content,
          content_type: msg.content_type || 'text',
          created_at: msg.created_at
        }));
        setMessages(formattedMessages);
        setCurrentConversationId(conversationId);
      }
    } catch (error) {
      console.error('加载历史消息失败:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadLatestConversation = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      // 获取对话列表，按时间排序，取最新的一个
      const conversationsResponse = await chatAPI.getConversations(1, 1, 0);
      if (conversationsResponse && Array.isArray(conversationsResponse) && conversationsResponse.length > 0) {
        const latestConversation = conversationsResponse[0];
        const conversationId = latestConversation.id;
        
        // 加载最新对话的消息
        const messagesResponse = await chatAPI.getChatHistory(50, conversationId);
        if (messagesResponse && Array.isArray(messagesResponse)) {
          const formattedMessages: ChatMessage[] = messagesResponse.map((msg: any) => ({
            id: msg.id,
            conversation_id: msg.conversation_id,
            role: msg.role,
            content: msg.content,
            content_type: msg.content_type || 'text',
            created_at: msg.created_at
          }));
          setMessages(formattedMessages);
          setCurrentConversationId(conversationId);
        }
      } else {
        // 如果没有对话，显示空状态
        setMessages([]);
        setCurrentConversationId(null);
      }
    } catch (error) {
      console.error('加载最新对话失败:', error);
      // 出错时也显示空状态
      setMessages([]);
      setCurrentConversationId(null);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // 如果提供了conversationId，自动加载历史消息
  // 如果启用了autoLoadLatest且没有指定conversationId，则加载最新对话
  useEffect(() => {
    if (conversationId) {
      loadConversationHistory(conversationId);
    } else if (autoLoadLatest && !conversationId) {
      loadLatestConversation();
    }
  }, [conversationId, loadConversationHistory, autoLoadLatest, loadLatestConversation]);

  return {
    messages,
    currentConversationId,
    sendMessage,
    createNewConversation,
    loadConversationHistory,
    loadLatestConversation,
    isLoading,
    isLoadingHistory
  };
};