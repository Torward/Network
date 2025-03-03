import { supabase } from "./supabase";

interface ChatMessage {
  id?: string;
  user_id?: string;
  content: string;
  role: "user" | "assistant";
  created_at?: string;
  conversation_id: string;
  metadata?: Record<string, any>;
}

interface ChatConversation {
  id?: string;
  user_id?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// Создать новую беседу
export async function createConversation(
  title?: string,
): Promise<ChatConversation | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deepseek_chat_conversations")
      .insert({
        user_id: authData.user.id,
        title: title || "Новая беседа",
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}

// Получить активную беседу или создать новую
export async function getOrCreateActiveConversation(): Promise<ChatConversation | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    // Попытка найти активную беседу
    const { data: existingConversation, error: fetchError } = await supabase
      .from("deepseek_chat_conversations")
      .select("*")
      .eq("user_id", authData.user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Если активная беседа найдена, вернуть её
    if (!fetchError && existingConversation) {
      return existingConversation;
    }

    // Если активной беседы нет, создать новую
    return await createConversation();
  } catch (error) {
    console.error("Error getting or creating active conversation:", error);
    return null;
  }
}

// Сохранить сообщение чата
export async function saveChatMessage(
  message: ChatMessage,
): Promise<ChatMessage | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deepseek_chat_messages")
      .insert({
        user_id: authData.user.id,
        content: message.content,
        role: message.role,
        conversation_id: message.conversation_id,
        metadata: message.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    // Обновить время последнего обновления беседы
    await supabase
      .from("deepseek_chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", message.conversation_id);

    return data;
  } catch (error) {
    console.error("Error saving chat message:", error);
    return null;
  }
}

// Получить сообщения беседы
export async function getConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deepseek_chat_messages")
      .select("*")
      .eq("user_id", authData.user.id)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    return [];
  }
}

// Получить список бесед пользователя
export async function getUserConversations(): Promise<ChatConversation[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deepseek_chat_conversations")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting user conversations:", error);
    return [];
  }
}

// Обновить заголовок беседы
export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<ChatConversation | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("deepseek_chat_conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", authData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating conversation title:", error);
    return null;
  }
}

// Удалить беседу и все её сообщения
export async function deleteConversation(
  conversationId: string,
): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    // Удаляем сообщения беседы
    const { error: messagesError } = await supabase
      .from("deepseek_chat_messages")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", authData.user.id);

    if (messagesError) throw messagesError;

    // Удаляем саму беседу
    const { error: conversationError } = await supabase
      .from("deepseek_chat_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", authData.user.id);

    if (conversationError) throw conversationError;

    return true;
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return false;
  }
}

// Установить беседу как активную
export async function setConversationActive(
  conversationId: string,
): Promise<boolean> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    // Сначала деактивируем все беседы пользователя
    const { error: deactivateError } = await supabase
      .from("deepseek_chat_conversations")
      .update({ is_active: false })
      .eq("user_id", authData.user.id);

    if (deactivateError) throw deactivateError;

    // Затем активируем нужную беседу
    const { error: activateError } = await supabase
      .from("deepseek_chat_conversations")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", authData.user.id);

    if (activateError) throw activateError;

    return true;
  } catch (error) {
    console.error("Error setting conversation as active:", error);
    return false;
  }
}
