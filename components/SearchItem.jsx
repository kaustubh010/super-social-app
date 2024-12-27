import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import Icon from "../assets/icons";
import { hp, wp } from "../helpers/common";
import Avatar from "./Avatar";
import { theme } from "../constants/theme";
import {
  followUser,
  isFollowing,
  unfollowUser,
} from "../services/followService";
import { createNotification } from "../services/notificationService";
import { useAuth } from "../contexts/AuthContext";

const SearchItem = ({ item, router }) => {
  const [followed, setFollowed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (item && user.id) {
        const following = await isFollowing(item.id, user.id);
        setFollowed(following); // Update the followed state
      }
    };

    checkFollowStatus();
  }, []);

  const openUserProfile = () => {
    router.push({
      pathname: "profile",
      params: { userId: item.id },
    });
  };

  const onFollow = async () => {
    if (followed) {
      // Unfollow User
      let res = await unfollowUser(item.id, user.id);
      if (res.success) {
        setFollowed(false);
      }
    } else {
      // Follow User
      let data = {
        follower_id: item.id,
        following_id: user.id,
      };
      let res = await followUser(data);
      if (res.success) {
        setFollowed(true);
        if (item.id != user.id) {
          // send notification
          let notify = {
            senderId: item.id,
            receiverId: user.id,
            title: "Followed You",
            data: JSON.stringify({ userId: item.id }),
          };
          createNotification(notify);
        }
      }
    }
  };

  return (
    <Pressable onPress={openUserProfile} style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={item?.image} size={hp(5)} />
        <View style={styles.textAndButtons}>
          <View style={styles.textSection}>
            <Text style={styles.name}>{item?.name}</Text>
            <Text style={styles.userName}>{item?.username}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            {item.id !== user.id && (
              <TouchableOpacity style={styles.chatButton} onPress={() => {}}>
                <Icon name="chat" size={hp(3.5)} />
              </TouchableOpacity>
            )}
            {item.id !== user.id && (
              <TouchableOpacity
                style={[
                  styles.followButton,
                  followed && { backgroundColor: theme.colors.gray },
                ]}
                onPress={onFollow}
              >
                <Text style={styles.followButtonText}>
                  {followed ? "Followed" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Text style={styles.bio}>{item?.bio}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  textAndButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: hp(2),
  },
  textSection: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    marginRight: 8,
    borderRadius: 20,
    padding: 8,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  followButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  userName: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: theme.colors.textDark,
    textAlign: "left",
    marginTop: 8,
  },
});

export default SearchItem;
