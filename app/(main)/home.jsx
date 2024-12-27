import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Button from "../../components/Button";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { StatusBar } from "expo-status-bar";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { fetchPosts } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/userService";
import BottomNavbar from "../../components/BottomNavbar";

var limit = 0;
const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleNewNotification = async (payload) => {
    if (payload.eventType == "INSERT" && payload.new.id) {
      setNotificationCount((prev) => prev + 1);
    }
  };

  const handlePostEvent = async (payload) => {
    if (payload.eventType == "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
    if (payload.eventType == "DELETE" && payload.old.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.filter(
          (post) => post.id != payload.old.id
        );
        return updatedPosts;
      });
    }
    if (payload.eventType == "UPDATE" && payload?.new?.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.map((post) => {
          if (post.id == payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };
  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();
    // getPosts();

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 10;
    let res = await fetchPosts(limit);
    if (res.success) {
      if (posts.length == res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Samidha</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                router.push("notifications");
              }}
            >
              <Icon
                name="notification"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => {}}>
              <Icon
                name="chat"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
          </View>
        </View>

        {/* Posts */}
        <FlatList
          data={posts}
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
              <View style={{ marginVertical: posts.length == 0 ? 200 : 40 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 40 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />
      </View>
      <BottomNavbar user={user} />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyle: {
    padding: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
