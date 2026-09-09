import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private supabase: SupabaseService) {}

  async searchProfiles(query: string, excludeId: string) {
    const { data } = await this.supabase.client
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${query}%`)
      .neq('id', excludeId)
      .limit(8);
    return data || [];
  }

  async myConversations(myId: string) {
    const { data: members } = await this.supabase.client
      .from('conversation_members')
      .select('conversation_id')
      .eq('profile_id', myId);

    const ids = (members || []).map((m: any) => m.conversation_id);
    if (ids.length === 0) return [];

    const { data: allMembers } = await this.supabase.client
      .from('conversation_members')
      .select('conversation_id, profile_id, profiles(username)')
      .in('conversation_id', ids);

    return ids.map((id) => {
      const other = (allMembers || []).find(
        (m: any) => m.conversation_id === id && m.profile_id !== myId
      );
      return { id, otherName: (other as any)?.profiles?.username || 'Conversación' };
    });
  }

  async startConversation(myId: string, otherId: string): Promise<string | null> {
    const { data: myConvos } = await this.supabase.client
      .from('conversation_members')
      .select('conversation_id')
      .eq('profile_id', myId);
    const { data: theirConvos } = await this.supabase.client
      .from('conversation_members')
      .select('conversation_id')
      .eq('profile_id', otherId);

    const myIds = new Set((myConvos || []).map((c: any) => c.conversation_id));
    const shared = (theirConvos || []).find((c: any) => myIds.has(c.conversation_id));
    if (shared) return shared.conversation_id;

    const { data: newConvo, error } = await this.supabase.client
      .from('conversations')
      .insert({ created_by: myId })
      .select()
      .single();
    if (error || !newConvo) return null;

    await this.supabase.client.from('conversation_members').insert([
      { conversation_id: newConvo.id, profile_id: myId },
      { conversation_id: newConvo.id, profile_id: otherId },
    ]);

    return newConvo.id;
  }

  async loadMessages(conversationId: string) {
    const { data } = await this.supabase.client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    return data || [];
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    await this.supabase.client.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    });
  }

  async otherMemberName(conversationId: string, myId: string) {
    const { data } = await this.supabase.client
      .from('conversation_members')
      .select('profile_id, profiles(username)')
      .eq('conversation_id', conversationId);
    const other = (data || []).find((m: any) => m.profile_id !== myId);
    return (other as any)?.profiles?.username || 'Conversación';
  }

  subscribeToMessages(conversationId: string, onInsert: (msg: any) => void) {
    const channel = this.supabase.client
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onInsert(payload.new)
      )
      .subscribe();
    return () => this.supabase.client.removeChannel(channel);
  }
}
