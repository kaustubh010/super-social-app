import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, msg: error.message };
  }
};

export const checkUsernameAvailability = async (username, userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', userId) // Exclude the current user's ID
    .maybeSingle(); // Expect one record or null

  if (error) {
    throw error;
  }

  return data === null; // If data is null, username is available
};

export const updateUser = async (userId, data) => {
  try {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId);

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, msg: error.message };
  }
};

export const getFeaturedUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("featured", true); // Fetch users where featured is true

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, msg: error.message };
  }
};