import { supabase } from "../lib/supabase";

export const searchUsers = async (keyword) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .or(`name.ilike.%${keyword}%,userName.ilike.%${keyword}%`); // Searches for matches in both `name` and `userName` columns

    if (error) {
      return { success: false, msg: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, msg: error.message };
  }
};
