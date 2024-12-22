import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { FlatList } from "react-native";
import { getUserData } from "../../services/userService";
import {
  followUser,
  isFollowing,
  unfollowUser,
} from "../../services/followService";
import { createNotification } from "../../services/notificationService";
import BottomNavbar from "../../components/BottomNavbar";

var limit = 0;
const Profile = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign out", "Error signing out");
    }
  };
  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 10;
    if (userId) {
      let res = await fetchPosts(limit, userId);
      if (res.success) {
        if (posts.length == res.data.length) setHasMore(false);
        setPosts(res.data);
      }
    } else {
      let res = await fetchPosts(limit, user.id);
      if (res.success) {
        if (posts.length == res.data.length) setHasMore(false);
        setPosts(res.data);
      }
    }
  };
  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };
  return (
    <ScreenWrapper>
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UseHeader user={user} router={router} handleLogout={handleLogout} />
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} currentUser={user} router={router} />
        )}
        onEndReached={() => {
          getPosts();
        }}
        onEndReachedThreshold={0}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>
                {posts.length == 0 ? "Post something here!" : "No more posts"}
              </Text>
            </View>
          )
        }
      />
      <BottomNavbar user={user} />
    </ScreenWrapper>
  );
};

const UseHeader = ({ user, router, handleLogout }) => {
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState(user);
  const [followed, setFollowed] = useState(false);

  const fetchUser = async () => {
    if (userId) {
      let res = await getUserData(userId);
      if (res.success) {
        setProfile(res.data);
      }
      if (userId == user.id) {
        setProfile(user);
      }
    }
  };

  const onFollow = async () => {
    if (followed) {
      // Unfollow User
      let res = await unfollowUser(user.id, userId);
      if (res.success) {
        setFollowed(false);
      }
    } else {
      // Follow User
      let data = {
        follower_id: user.id,
        following_id: userId,
      };
      let res = await followUser(data);
      if (res.success) {
        setFollowed(true);
        if (user.id != userId) {
          // send notification
          let notify = {
            senderId: user.id,
            receiverId: userId,
            title: "Followed You",
          };
          createNotification(notify);
        }
      }
    }
  };

  useEffect(() => {
    fetchUser();
    // Check if currentUser is following the post's user
    const checkFollowStatus = async () => {
      if (user && userId) {
        const following = await isFollowing(user.id, userId);
        setFollowed(following); // Update the followed state
      }
    };

    checkFollowStatus();
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title={"Profile"} mb={30} />
        {!userId && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name={"logout"} color={theme.colors.rose} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={profile?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            {!userId && (
              <Pressable
                style={styles.editIcon}
                onPress={() => router.push("editProfile")}
              >
                <Icon name={"edit"} strokeWidth={2.5} size={20} />
              </Pressable>
            )}
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{profile && profile?.name}</Text>
            <Text style={styles.infoText}>{profile && profile?.userName}</Text>
          </View>
          <View style={{ gap: 10 }}>
            {!userId && (
              <View style={styles.info}>
                <Icon name={"mail"} size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{profile && profile.email}</Text>
              </View>
            )}
            {!userId && profile && profile.phoneNumber && (
              <View style={styles.info}>
                <Icon name={"call"} size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {profile && profile.phoneNumber}
                </Text>
              </View>
            )}
            {!userId && profile && profile.address && (
              <View style={styles.info}>
                <Icon name={"location"} size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {profile && profile.address}
                </Text>
              </View>
            )}
            {profile && profile.bio && (
              <Text style={styles.infoText}>{profile.bio}</Text>
            )}
            {userId && userId !== user.id && (
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    followed && { backgroundColor: theme.colors.gray },
                  ]}
                  onPress={onFollow}
                >
                  <Text style={styles.followText}>
                    {followed ? "Followed" : "Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  followButton: {
    height: hp(4.5), // Adjust button height
    width: wp(80), // Add a fixed width for a compact look
    borderRadius: theme.radius.md, // Add rounded corners
    paddingVertical: hp(0.5), // Adjust vertical padding
    paddingHorizontal: wp(2), // Adjust horizontal padding
    backgroundColor: theme.colors.primaryDark, // Example color: iOS-like blue
    justifyContent: "center",
    alignItems: "center",
  },
  followText: {
    fontSize: hp(2), // Smaller font size
    color: "white", // White text for contrast
    fontWeight: theme.fonts.semibold, // Slightly bold text
  },
});
