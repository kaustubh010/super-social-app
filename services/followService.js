import { supabase } from "../lib/supabase";

export const followUser = async (follow) => {
  try {
    const { data, error } = await supabase.from("followers").insert(follow);

    if (error) {
      console.error("Error following user:", error);
      return { success: false, msg: "Something went wrong!" };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error following user:", error);
    return { success: false, msg: "Something went wrong!" };
  }
};

export const unfollowUser = async (followerId, followingId) => {
  try {
    const { error } = await supabase
      .from("followers")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) {
      console.error("unfollowing user:", error);
      return { success: false, msg: "Could not unfollow user" };
    }

    return { success: true };
  } catch (error) {
    console.error("unfollowing user:", error);
    return { success: false, msg: "Could not unfollow user" };
  }
};

export const isFollowing = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) {
      console.error("checking follow status:", error);
      return false;
    }

    return data.length > 0;
  } catch (error) {
    console.error("checking follow status:", error);
    return false;
  }
};

export const fetchFollowedUsers = async (userId) => {
  try {
    // Query the `followers` table to get all users followed by the current user
    const { data, error } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId); // Get all the users the current user is following

    if (error) throw error;

    // Return an array of userIds that the current user is following
    return data.map((follow) => follow.following_id);
  } catch (error) {
    console.error("Error fetching followed users:", error);
    return [];
  }
};
