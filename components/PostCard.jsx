import {
  Alert,
  Button,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";

import React, { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";
import RenderHTML from "react-native-render-html";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "../components/Loading";
import * as ScreenOrientation from 'expo-screen-orientation';

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};
const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
};
const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcons = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const shadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state

  useEffect(() => {
    setLikes(item?.postLikes);
  }, []);

  const handleFullscreenUpdate = async (event) => {
    if (event.fullscreenUpdate === Video.FULLSCREEN_UPDATE_ENTER) {
      // Entering fullscreen - lock to landscape
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (event.fullscreenUpdate === Video.FULLSCREEN_UPDATE_EXIT) {
      // Exiting fullscreen - reset to default
      await ScreenOrientation.unlockAsync();
    }
  };
  

  const openUserProfile = () => {
    router.push({
      pathname: "profile",
      params: { userId: item.userId },
    });
  };

  const openPostDetails = () => {
    if (!showMoreIcons) return null;
    router.push({ pathname: "postDetails", params: { postId: item?.id } });
  };
  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.body) };
    if (item?.file) {
      // download the file then share the local uri
      setLoading(true);
      let url = await downloadFile(getSupabaseFileUrl(item?.file).uri);
      setLoading(false);
      content.url = url;
    }
    Share.share(content);
  };

  const onLike = async () => {
    if (liked) {
      // remove like
      let updatedLikes = likes.filter((like) => like.userId != currentUser?.id);

      setLikes([...updatedLikes]);
      let res = await removePostLike(item?.id, currentUser?.id);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    } else {
      // create like
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    }
  };

  const handlePostDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to do this?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ]);
  };

  const created_at = moment(item?.created_at).format("MMM D");
  const liked = likes.filter((like) => like.userId == currentUser?.id)[0]
    ? true
    : false;

  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={openUserProfile} style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{created_at}</Text>
          </View>
        </TouchableOpacity>

        {showMoreIcons && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name={"threeDotsHorizontal"}
              size={hp(3.4)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
        {showDelete && currentUser.id == item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name={"edit"} size={hp(2.5)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name={"delete"} size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Post body & media */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>
        {/* Post Image with TouchableOpacity */}
        {item?.file && item?.file.includes("postImages") && (
          <>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Image
                source={getSupabaseFileUrl(item?.file)}
                transition={100}
                style={styles.postMedia}
                contentFit="cover"
              />
            </TouchableOpacity>

            {/* Fullscreen Modal */}
            <Modal
              visible={isModalVisible}
              onRequestClose={() => setIsModalVisible(false)}
              transparent={true}
              animationType="fade"
            >
              <View style={styles.modalContainer}>
                <Image
                  source={getSupabaseFileUrl(item?.file)}
                  style={styles.fullscreenImage}
                />
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </>
        )}

        {/* post video */}
        {item?.file && item?.file.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item?.file)}
            useNativeControls
            resizeMode="cover"
            isLooping
            onFullscreenUpdate={handleFullscreenUpdate}
          />
        )}
      </View>
      {/* like, comment & share */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name={"heart"}
              size={24}
              fill={liked ? theme.colors.rose : "transparent"}
              color={liked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name={"comment"} size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{item?.comments[0]?.count}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size={"small"} />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name={"share"} size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
  },
  fullscreenImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  closeText: {
    fontSize: 16,
    color: "black",
  },
});
