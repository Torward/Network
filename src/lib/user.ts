import { supabase } from "./supabase";

// Fetch current user data from the users table
export async function fetchCurrentUserData() {
  try {
    // First get the authenticated user
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) {
      throw new Error("No authenticated user found");
    }

    // Then fetch the user profile data from the users table
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Fetch user by ID
export async function fetchUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
}

// Update user's online status
export async function updateUserOnlineStatus(
  userId: string,
  isOnline: boolean,
) {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        is_online: isOnline,
        last_active: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating user online status:", error);
    return false;
  }
}

// Get user connections (friends, pending, suggested)
export async function getUserConnections(
  userId: string,
  connectionType?: string,
) {
  try {
    let query = supabase
      .from("user_connections")
      .select(
        `
        *,
        connected_user:users!user_connections_connected_user_id_fkey(*)
      `,
      )
      .eq("user_id", userId);

    if (connectionType) {
      query = query.eq("connection_type", connectionType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user connections:", error);
    return [];
  }
}

// Get mutual friends between two users
export async function getMutualFriends(userId1: string, userId2: string) {
  try {
    // Get friends of user1
    const { data: user1Friends, error: error1 } = await supabase
      .from("user_connections")
      .select("connected_user_id")
      .eq("user_id", userId1)
      .eq("connection_type", "friend");

    if (error1) throw error1;

    // Get friends of user2
    const { data: user2Friends, error: error2 } = await supabase
      .from("user_connections")
      .select("connected_user_id")
      .eq("user_id", userId2)
      .eq("connection_type", "friend");

    if (error2) throw error2;

    // Find mutual friends
    const user1FriendIds = user1Friends.map((f) => f.connected_user_id);
    const user2FriendIds = user2Friends.map((f) => f.connected_user_id);
    const mutualFriendIds = user1FriendIds.filter((id) =>
      user2FriendIds.includes(id),
    );

    // Get details of mutual friends
    if (mutualFriendIds.length > 0) {
      const { data: mutualFriends, error } = await supabase
        .from("users")
        .select("*")
        .in("id", mutualFriendIds);

      if (error) throw error;
      return mutualFriends;
    }

    return [];
  } catch (error) {
    console.error("Error fetching mutual friends:", error);
    return [];
  }
}
