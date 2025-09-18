import React, { useState } from 'react';
import { Button } from './Button';

interface AudioPlayButtonProps {
  text: string;
  messageId: string;
  isPlaying: boolean;
  onPlay: (text: string, messageId: string) => Promise<void>;
  className?: string;
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  text,
  messageId,
  isPlaying,
  onPlay,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleClick = async () => {
    if (isPlaying || isLoading) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      await onPlay(text, messageId);
    } catch (error) {
      console.error('播放失败:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (hasError) {
      return (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs">重试</span>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="flex items-center space-x-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          <span className="text-xs">生成中</span>
        </div>
      );
    }
    
    if (isPlaying) {
      return (
        <div className="flex items-center space-x-1">
          <div className="flex space-x-0.5">
            <div className="w-1 h-3 bg-blue-500 rounded animate-pulse"></div>
            <div className="w-1 h-3 bg-blue-500 rounded animate-pulse animation-delay-100"></div>
            <div className="w-1 h-3 bg-blue-500 rounded animate-pulse animation-delay-200"></div>
          </div>
          <span className="text-xs">播放中</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.794a1 1 0 011-.13zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
        <span className="text-xs">播放</span>
      </div>
    );
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPlaying || isLoading}
      className={`min-w-[80px] h-8 ${className} ${
        hasError 
          ? 'border-red-300 text-red-600 hover:bg-red-50' 
          : isPlaying 
            ? 'border-blue-300 text-blue-600 bg-blue-50' 
            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {getButtonContent()}
    </Button>
  );
};
