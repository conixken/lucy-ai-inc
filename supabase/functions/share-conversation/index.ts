import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { conversationId, expiresIn, isPublic = true, password } = await req.json();

    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    // Verify user owns the conversation
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found or access denied');
    }

    let expiresAt = null;
    if (expiresIn) {
      const now = new Date();
      const expiresDate = new Date(now.getTime() + expiresIn * 1000);
      expiresAt = expiresDate.toISOString();
    }

    let passwordHash = null;
    if (password) {
      // Simple hash for demo - in production use bcrypt
      passwordHash = btoa(password);
    }

    const { data: share, error: shareError } = await supabaseClient
      .from('shared_conversations')
      .insert({
        conversation_id: conversationId,
        created_by: user.id,
        expires_at: expiresAt,
        is_public: isPublic,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (shareError) {
      console.error('Share creation error:', shareError);
      throw new Error('Failed to create share link');
    }

    const shareUrl = `${req.headers.get('origin')}/shared/${share.share_token}`;

    return new Response(
      JSON.stringify({ 
        shareToken: share.share_token,
        shareUrl,
        expiresAt: share.expires_at 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Share conversation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
