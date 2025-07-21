'use client';
import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './auth-context';

export type HistoryItem = {
  id: string;
  type: 'crop' | 'mandi' | 'scheme';
  query: Record<string, any>;
  response: Record<string, any>;
  timestamp: string;
  userId: string;
};

interface HistoryContextType {
  history: HistoryItem[];
  loading: boolean;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    };
    setLoading(true);
    try {
      const q = query(collection(db, 'history'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HistoryItem[];
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch history from Firestore', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const addHistoryItem = useCallback(async (item: Omit<HistoryItem, 'id' | 'timestamp' | 'userId'>) => {
    if (!user) return;
    
    const newHistoryItem: Omit<HistoryItem, 'id'> = {
      ...item,
      userId: user.uid,
      timestamp: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, 'history'), newHistoryItem);
      setHistory(prev => [{ ...newHistoryItem, id: docRef.id }, ...prev]);
    } catch (error) {
      console.error('Failed to save history to Firestore', error);
    }
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      // Create a copy to avoid mutation while iterating
      const historyToDelete = [...history];
      setHistory([]); // Optimistic update
      for (const item of historyToDelete) {
        await deleteDoc(doc(db, 'history', item.id));
      }
    } catch (error) {
      console.error('Failed to clear history from Firestore', error);
      setHistory(history); // Revert on error
    }
  }, [user, history]);

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
