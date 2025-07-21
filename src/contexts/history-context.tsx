'use client';
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export type HistoryItem = {
  id: string;
  type: 'crop' | 'mandi' | 'scheme';
  query: Record<string, any>;
  response: Record<string, any>;
  timestamp: string;
};

interface HistoryContextType {
  history: HistoryItem[];
  loading: boolean;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'khet_ai_history';

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newHistoryItem: HistoryItem = {
      ...item,
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toISOString(),
    };
    
    setHistory(prev => {
      const updatedHistory = [newHistoryItem, ...prev];
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save history to localStorage', error);
      }
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history from localStorage', error);
    }
  }, []);

  return (
    <HistoryContext.Provider value={{ history, loading, addHistoryItem, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
