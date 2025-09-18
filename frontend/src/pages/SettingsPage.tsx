import React, { useState, useEffect } from 'react';
import { configAPI, ollamaAPI, SystemPromptAPI } from '../services/api';
import { OllamaConfig, IndexTTSConfig, SystemPromptConfig } from '../types/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Tabs, TabList, Tab, TabContent } from '../components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { SystemPromptCard } from '../components/ui/SystemPromptCard';
import { Modal } from '../components/ui/Modal';
import { SystemPromptForm } from '../components/ui/SystemPromptForm';

const SettingsPage: React.FC = () => {
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig | null>(null);
  const [ttsConfig, setTtsConfig] = useState<IndexTTSConfig | null>(null);
  const [systemPromptConfig, setSystemPromptConfig] = useState<SystemPromptConfig | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  
  // 浮窗表单状态
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadConfig();
    getOllamaModelsList(); // 加载模型列表
    loadSystemPrompts(); // 加载系统提示词列表
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const [ollamaResponse, ttsResponse, systemPromptResponse] = await Promise.all([
        configAPI.getOllamaConfig(),
        configAPI.getTTSConfig(),
        SystemPromptAPI.getActivePrompt() // 让API自己处理错误
      ]);
      
      setOllamaConfig(ollamaResponse);
      setTtsConfig(ttsResponse);
      
      // 设置系统提示词配置
      setSystemPromptConfig(systemPromptResponse);
    } catch (error) {
      console.error('加载配置失败:', error);
      setMessage({ type: 'error', text: '加载配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOllamaConfig = async () => {
    if (!ollamaConfig) return;
    
    try {
      setSaving(true);
      
      // 如果默认模型发生了变化，先设置默认模型
      if (ollamaConfig.default_model) {
        await ollamaAPI.setDefaultModel(ollamaConfig.default_model);
      }
      
      // 然后更新其他配置
      await configAPI.updateOllamaConfig(ollamaConfig);
      
      setMessage({ type: 'success', text: 'Ollama配置保存成功' });
    } catch (error) {
      console.error('保存Ollama配置失败:', error);
      setMessage({ type: 'error', text: '保存Ollama配置失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTTSConfig = async () => {
    if (!ttsConfig) return;
    
    try {
      setSaving(true);
      await configAPI.updateTTSConfig(ttsConfig);
      setMessage({ type: 'success', text: 'TTS配置保存成功' });
    } catch (error) {
      console.error('保存TTS配置失败:', error);
      setMessage({ type: 'error', text: '保存TTS配置失败' });
    } finally {
      setSaving(false);
    }
  };

  const getOllamaModelsList = async () => {
    try {
      const response = await ollamaAPI.getModels();
      console.log('Ollama模型响应:', response); // 调试日志
      
      if (response.success && response.models) {
        const modelNames = response.models.map((model: any) => model.name);
        setOllamaModels(modelNames);
        return modelNames;
      }
      return [];
    } catch (error) {
      console.error('获取模型列表失败:', error);
      return [];
    }
  };

  const loadSystemPrompts = async () => {
    try {
      setLoadingPrompts(true);
      const prompts = await SystemPromptAPI.getSystemPrompts();
      setSystemPrompts(prompts);
    } catch (error) {
      console.error('加载系统提示词列表失败:', error);
      setMessage({ type: 'error', text: '加载系统提示词列表失败' });
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleActivatePrompt = async (promptId: number) => {
    try {
      await SystemPromptAPI.activateSystemPrompt(promptId);
      setMessage({ type: 'success', text: '系统提示词已激活' });
      // 重新加载列表和当前配置
      await Promise.all([loadSystemPrompts(), loadConfig()]);
    } catch (error) {
      console.error('激活系统提示词失败:', error);
      setMessage({ type: 'error', text: '激活系统提示词失败' });
    }
  };

  const handleDeletePrompt = async (promptId: number) => {
    if (!confirm('确定要删除这个系统提示词吗？此操作不可撤销。')) {
      return;
    }

    try {
      await SystemPromptAPI.deleteSystemPrompt(promptId);
      setMessage({ type: 'success', text: '系统提示词已删除' });
      // 重新加载列表和当前配置
      await Promise.all([loadSystemPrompts(), loadConfig()]);
    } catch (error) {
      console.error('删除系统提示词失败:', error);
      setMessage({ type: 'error', text: '删除系统提示词失败' });
    }
  };

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setIsFormModalOpen(true);
  };

  const handleEditPrompt = (promptId: number) => {
    const prompt = systemPrompts.find(p => p.id === promptId);
    if (prompt) {
      setEditingPrompt(prompt);
      setIsFormModalOpen(true);
    }
  };

  const handleFormSubmit = async (data: { name: string; content: string; isActive: boolean }) => {
    setFormLoading(true);
    try {
      if (editingPrompt) {
        // 更新现有提示词
        await SystemPromptAPI.updateSystemPrompt(editingPrompt.id, data);
        setMessage({ type: 'success', text: '系统提示词已更新' });
      } else {
        // 创建新提示词
        await SystemPromptAPI.createSystemPrompt(data);
        setMessage({ type: 'success', text: '系统提示词已创建' });
      }
      
      // 重新加载列表和当前配置
      await Promise.all([loadSystemPrompts(), loadConfig()]);
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('保存系统提示词失败:', error);
      setMessage({ type: 'error', text: '保存系统提示词失败' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
    setEditingPrompt(null);
  };

  const handleTestOllamaConnection = async () => {
    try {
      setLoading(true);
      const models = await getOllamaModelsList();
      setMessage({ 
        type: 'success', 
        text: `连接成功！找到 ${models.length} 个模型` 
      });
    } catch (error) {
      console.error('测试连接失败:', error);
      setMessage({ type: 'error', text: '连接失败，请检查配置' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestTTSConnection = async () => {
    try {
      setLoading(true);
      await configAPI.testTTSConnection();
      setMessage({ type: 'success', text: 'TTS连接测试成功' });
    } catch (error) {
      console.error('TTS连接测试失败:', error);
      setMessage({ type: 'error', text: 'TTS连接测试失败' });
    } finally {
      setLoading(false);
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">系统设置</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 消息提示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="float-right text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        <Tabs defaultValue="ollama" className="space-y-6">
          <TabList>
            <Tab value="ollama">Ollama 配置</Tab>
            <Tab value="systemPrompt">系统提示词</Tab>
            <Tab value="tts">TTS 配置</Tab>
          </TabList>
          
          {/* Ollama 配置 */}
          <TabContent value="ollama">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Ollama 配置</h2>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleTestOllamaConnection}
                    disabled={loading}
                  >
                    测试连接
                  </Button>
                  <Button
                    onClick={handleSaveOllamaConfig}
                    disabled={saving || !ollamaConfig}
                  >
                    {saving ? '保存中...' : '保存配置'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    服务地址
                  </label>
                  <Input
                    value={ollamaConfig?.base_url || ''}
                    onChange={(e) => ollamaConfig && setOllamaConfig({
                      ...ollamaConfig,
                      base_url: e.target.value
                    })}
                    placeholder="http://localhost:11434"
                    disabled={!ollamaConfig}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    默认模型
                  </label>
                  <Select
                    value={ollamaConfig?.default_model || ''}
                    onChange={(e) => {
                      if (ollamaConfig) {
                        setOllamaConfig({
                          ...ollamaConfig,
                          default_model: e.target.value
                        });
                        // 立即保存默认模型选择
                        if (e.target.value) {
                          ollamaAPI.setDefaultModel(e.target.value).catch(error => {
                            console.error('设置默认模型失败:', error);
                            setMessage({ type: 'error', text: '设置默认模型失败' });
                          });
                        }
                      }
                    }}
                    options={ollamaModels.map(model => ({ value: model, label: model }))}
                    disabled={!ollamaConfig}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    超时时间 (秒)
                  </label>
                  <Input
                    type="number"
                    value={ollamaConfig?.timeout || 60}
                    onChange={(e) => ollamaConfig && setOllamaConfig({
                      ...ollamaConfig,
                      timeout: parseInt(e.target.value) || 60
                    })}
                    min="1"
                    max="300"
                    disabled={!ollamaConfig}
                  />
                </div>
              </div>
            </Card>
          </TabContent>


          {/* 系统提示词配置 */}
          <TabContent value="systemPrompt">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">系统提示词管理</h2>
                <Button
                  onClick={handleCreatePrompt}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  + 新建系统提示词
                </Button>
              </div>
              
              {/* 当前激活的提示词显示 */}
              {systemPromptConfig?.system_prompt && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">
                        当前激活: {systemPromptConfig.system_prompt.name}
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        {systemPromptConfig.system_prompt.system_prompt.length > 100 
                          ? systemPromptConfig.system_prompt.system_prompt.substring(0, 100) + '...'
                          : systemPromptConfig.system_prompt.system_prompt
                        }
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => systemPromptConfig.system_prompt.id && handleEditPrompt(systemPromptConfig.system_prompt.id)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-100"
                    >
                      编辑
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* 已保存的系统提示词列表 */}
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">已保存的系统提示词</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSystemPrompts}
                  disabled={loadingPrompts}
                >
                  {loadingPrompts ? '加载中...' : '刷新'}
                </Button>
              </div>

              {loadingPrompts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">正在加载系统提示词...</p>
                </div>
              ) : systemPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">📝</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    暂无系统提示词
                  </h4>
                  <p className="text-gray-500">
                    创建并保存您的第一个系统提示词
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {systemPrompts.map((prompt) => (
                    <SystemPromptCard
                      key={prompt.id}
                      id={prompt.id}
                      name={prompt.name}
                      content={prompt.system_prompt}
                      isActive={prompt.is_active}
                      createdAt={prompt.created_at}
                      onActivate={handleActivatePrompt}
                      onEdit={handleEditPrompt}
                      onDelete={handleDeletePrompt}
                    />
                  ))}
                </div>
              )}
            </Card>
          </TabContent>

          {/* TTS 配置 */}
          <TabContent value="tts">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">TTS 配置</h2>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleTestTTSConnection}
                    disabled={loading}
                  >
                    测试连接
                  </Button>
                  <Button
                    onClick={handleSaveTTSConfig}
                    disabled={saving || !ttsConfig}
                  >
                    {saving ? '保存中...' : '保存配置'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    服务地址
                  </label>
                  <Input
                    value={ttsConfig?.base_url || ''}
                    onChange={(e) => ttsConfig && setTtsConfig({
                      ...ttsConfig,
                      base_url: e.target.value
                    })}
                    placeholder="http://localhost:8000"
                    disabled={!ttsConfig}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    默认音频提示
                  </label>
                  <Input
                    value={ttsConfig?.default_audio_prompt || ''}
                    onChange={(e) => ttsConfig && setTtsConfig({
                      ...ttsConfig,
                      default_audio_prompt: e.target.value
                    })}
                    placeholder="examples/natural.wav"
                    disabled={!ttsConfig}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    超时时间 (秒)
                  </label>
                  <Input
                    type="number"
                    value={ttsConfig?.timeout || 60}
                    onChange={(e) => ttsConfig && setTtsConfig({
                      ...ttsConfig,
                      timeout: parseInt(e.target.value) || 60
                    })}
                    min="1"
                    max="300"
                    disabled={!ttsConfig}
                  />
                </div>
              </div>
            </Card>
          </TabContent>
        </Tabs>
      </div>

      {/* 系统提示词表单浮窗 */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        title={editingPrompt ? '编辑系统提示词' : '新建系统提示词'}
        className="max-w-2xl"
      >
        <SystemPromptForm
          isOpen={isFormModalOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          initialData={editingPrompt}
          title={editingPrompt ? '编辑系统提示词' : '新建系统提示词'}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default SettingsPage;
