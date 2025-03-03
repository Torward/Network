import { supabase } from "./supabase";

interface UIComponentSettings {
  id?: string;
  user_id?: string;
  component_id: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

// Сохранить настройки UI компонента
export async function saveUISettings(settings: UIComponentSettings) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ui_settings")
      .upsert({
        user_id: authData.user.id,
        component_id: settings.component_id,
        position_x: settings.position_x,
        position_y: settings.position_y,
        width: settings.width,
        height: settings.height,
        is_visible: settings.is_visible,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error saving UI settings:", error);
    return null;
  }
}

// Получить настройки UI компонента
export async function getUISettings(componentId: string) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ui_settings")
      .select("*")
      .eq("user_id", authData.user.id)
      .eq("component_id", componentId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "No rows found"
    return data;
  } catch (error) {
    console.error("Error getting UI settings:", error);
    return null;
  }
}

// Обновить видимость компонента
export async function updateComponentVisibility(
  componentId: string,
  isVisible: boolean,
) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ui_settings")
      .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
      .eq("user_id", authData.user.id)
      .eq("component_id", componentId)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error updating component visibility:", error);
    return null;
  }
}

// Обновить позицию компонента
export async function updateComponentPosition(
  componentId: string,
  position: { x: number; y: number },
) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ui_settings")
      .update({
        position_x: position.x,
        position_y: position.y,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", authData.user.id)
      .eq("component_id", componentId)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error updating component position:", error);
    return null;
  }
}

// Обновить размер компонента
export async function updateComponentSize(
  componentId: string,
  size: { width: number; height: number },
) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ui_settings")
      .update({
        width: size.width,
        height: size.height,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", authData.user.id)
      .eq("component_id", componentId)
      .select();

    if (error) throw error;
    return data?.[0];
  } catch (error) {
    console.error("Error updating component size:", error);
    return null;
  }
}

// Получить все настройки UI для пользователя
export async function getAllUISettings() {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("ui_settings")
      .select("*")
      .eq("user_id", authData.user.id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting all UI settings:", error);
    return [];
  }
}
