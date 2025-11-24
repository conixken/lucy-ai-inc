import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Memory {
  id: string;
  content: string;
  memory_type: string;
  importance_score: number;
  created_at: string;
  last_accessed: string;
}

export const useMemoryManager = (userId: string | undefined) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadMemories();
  }, [userId]);

  const loadMemories = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_memories')
        .select('*')
        .eq('user_id', userId)
        .order('importance_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error loading memories:', error);
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const storeMemory = async (content: string, type: string = 'fact', importance: number = 0.5) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_memories')
        .insert({
          user_id: userId,
          content,
          memory_type: type,
          importance_score: importance
        })
        .select()
        .single();

      if (error) throw error;
      setMemories(prev => [data, ...prev]);
      toast.success('Memory stored');
      return data;
    } catch (error) {
      console.error('Error storing memory:', error);
      toast.error('Failed to store memory');
    }
  };

  const updateMemoryAccess = async (memoryId: string) => {
    try {
      await supabase
        .from('user_memories')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', memoryId);
    } catch (error) {
      console.error('Error updating memory access:', error);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from('user_memories')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      toast.success('Memory deleted');
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast.error('Failed to delete memory');
    }
  };

  const getRelevantMemories = async (query: string) => {
    // Simple keyword-based search (could be enhanced with embeddings)
    const keywords = query.toLowerCase().split(' ');
    return memories.filter(m => 
      keywords.some(kw => m.content.toLowerCase().includes(kw))
    );
  };

  return {
    memories,
    loading,
    storeMemory,
    updateMemoryAccess,
    deleteMemory,
    getRelevantMemories,
    refreshMemories: loadMemories
  };
};