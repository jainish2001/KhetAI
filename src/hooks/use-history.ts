'use client';
import { useState, useEffect, useCallback } from 'react';

export type HistoryItem = {
  id: string;
  type: 'crop' | 'mandi' | 'scheme';
  query: Record<string, any>;
  response: Record<string, any>;
  timestamp: string;
};

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('khetai-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to parse history from localStorage', error);
      setHistory([]);
    }
  }, []);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setHistory(prevHistory => {
      const newHistoryItem: HistoryItem = {
        ...item,
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
      };
      const updatedHistory = [newHistoryItem, ...prevHistory];
      try {
        localStorage.setItem('khetai-history', JSON.stringify(updatedHistory));
      } catch (error) {
        console.error('Failed to save history to localStorage', error);
      }
      return updatedHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('khetai-history');
    } catch (error) {
      console.error('Failed to clear history from localStorage', error);
    }
  }, []);

  return { history, addHistoryItem, clearHistory };
}
