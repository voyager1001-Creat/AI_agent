/**
 * 用户状态管理
 * 使用zustand管理用户相关状态
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { User } from '../types/api';
import { STORAGE_KEYS } from '../constants';

interface UserState {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userAvatar: string | null;
  aiAvatar: string | null;
  
  // 操作
  setUser: (user: User | null) => void;
  setUserAvatar: (avatar: string | null) => void;
  setAIAvatar: (avatar: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userAvatar: null,
  aiAvatar: null,
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // 设置用户
        setUser: (user: User | null) => {
          set({
            user,
            isAuthenticated: !!user,
            error: null
          });
        },

        // 设置用户头像
        setUserAvatar: (avatar: string | null) => {
          set({ userAvatar: avatar });
        },

        // 设置AI头像
        setAIAvatar: (avatar: string | null) => {
          set({ aiAvatar: avatar });
        },

        // 设置加载状态
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // 设置错误
        setError: (error: string | null) => {
          set({ error });
        },

        // 清除错误
        clearError: () => {
          set({ error: null });
        },

        // 登出
        logout: () => {
          set(initialState);
        },
      }),
      {
        name: STORAGE_KEYS.user,
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          userAvatar: state.userAvatar,
          aiAvatar: state.aiAvatar,
        }),
      }
    ),
    {
      name: 'user-store',
    }
  )
);

// 选择器函数
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useUserLoading = () => useUserStore((state) => state.isLoading);
export const useUserError = () => useUserStore((state) => state.error);
export const useUserAvatar = () => useUserStore((state) => state.userAvatar);
export const useAIAvatar = () => useUserStore((state) => state.aiAvatar);

// 操作函数
export const useUserActions = () => useUserStore((state) => ({
  setUser: state.setUser,
  setUserAvatar: state.setUserAvatar,
  setAIAvatar: state.setAIAvatar,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  logout: state.logout,
}));