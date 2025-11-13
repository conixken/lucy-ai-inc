-- Create search function for full-text search
CREATE OR REPLACE FUNCTION search_messages(search_query TEXT)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  conversation_title TEXT,
  content TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    c.title as conversation_title,
    m.content,
    m.role,
    m.created_at,
    ts_rank(m.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  WHERE 
    c.user_id = auth.uid()
    AND m.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT 50;
END;
$$;