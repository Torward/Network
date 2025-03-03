-- Таблица для хранения настроек интерфейса пользователя
CREATE TABLE IF NOT EXISTS ui_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id TEXT NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, component_id)
);

-- Включаем RLS для таблицы
ALTER TABLE ui_settings ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы ui_settings
CREATE POLICY "Users can view their own UI settings" 
  ON ui_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own UI settings" 
  ON ui_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own UI settings" 
  ON ui_settings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own UI settings" 
  ON ui_settings FOR DELETE 
  USING (auth.uid() = user_id);

-- Таблица для хранения сообщений чата с Deepseek R1
CREATE TABLE IF NOT EXISTS deepseek_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Включаем RLS для таблицы
ALTER TABLE deepseek_chat_messages ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы deepseek_chat_messages
CREATE POLICY "Users can view their own chat messages" 
  ON deepseek_chat_messages FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" 
  ON deepseek_chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" 
  ON deepseek_chat_messages FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages" 
  ON deepseek_chat_messages FOR DELETE 
  USING (auth.uid() = user_id);

-- Таблица для хранения сессий чата с Deepseek R1
CREATE TABLE IF NOT EXISTS deepseek_chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Включаем RLS для таблицы
ALTER TABLE deepseek_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы deepseek_chat_conversations
CREATE POLICY "Users can view their own chat conversations" 
  ON deepseek_chat_conversations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat conversations" 
  ON deepseek_chat_conversations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat conversations" 
  ON deepseek_chat_conversations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat conversations" 
  ON deepseek_chat_conversations FOR DELETE 
  USING (auth.uid() = user_id);

-- Таблица для хранения взаимодействий с AR
CREATE TABLE IF NOT EXISTS ar_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Включаем RLS для таблицы
ALTER TABLE ar_interactions ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы ar_interactions
CREATE POLICY "Users can view their own AR interactions" 
  ON ar_interactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AR interactions" 
  ON ar_interactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Включаем realtime для всех таблиц
ALTER PUBLICATION supabase_realtime ADD TABLE ui_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE deepseek_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE deepseek_chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE ar_interactions;

-- Создаем функцию для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_ui_settings_updated_at
BEFORE UPDATE ON ui_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deepseek_chat_conversations_updated_at
BEFORE UPDATE ON deepseek_chat_conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();