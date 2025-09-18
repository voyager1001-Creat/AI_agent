import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  className = ''
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`space-y-6 ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabContentProps {
  value: string;
  children: React.ReactNode;
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = '' }: TabListProps) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

interface TabProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ value, children, className = '' }: TabProps) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab must be used within Tabs');
  }

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabContent: React.FC<TabContentProps> = ({ value, children }: TabContentProps) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('TabContent must be used within Tabs');
  }

  return (
    <div data-tab={value} style={{ display: context.activeTab === value ? 'block' : 'none' }}>
      {children}
    </div>
  );
};