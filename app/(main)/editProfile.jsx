import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { Image } from "expo-image";
import { useAuth } from "../../contexts/AuthContext";
import { getUserImageSrc, uploadFile } from "../../services/imageService";
import { checkUsernameAvailability } from "../../services/userService";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { updateUser } from "../../services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const EditProfile = () => {
  const router = useRouter();
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
    username: "",
    instagram: "",
    facebook: "",
    linkedin: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || null,
        bio: currentUser.bio || "",
        address: currentUser.address || "",
        username: currentUser.username || "",
        instagram: currentUser.instagram || "",
        facebook: currentUser.facebook || "",
        linkedin: currentUser.linkedin || "",
      });
    }
  }, [currentUser]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, address, image, bio, username, instagram, facebook, linkedin } = userData;

    if (!name || !phoneNumber || !address || !bio || !username) {
      Alert.alert("Profile", "Please fill all the fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ Check if username is available
      const isAvailable = await checkUsernameAvailability(
        username,
        currentUser?.id
      );
      if (!isAvailable) {
        Alert.alert(
          "Profile",
          "This username is already taken. Please choose another one."
        );
        setLoading(false);
        return;
      }

      // ✅ Handle image upload if image is updated
      if (typeof image === "object") {
        let imageRes = await uploadFile("profiles", image?.uri, true);
        if (imageRes.success) userData.image = imageRes.data;
        else userData.image = null;
      }

      // ✅ Update user profile
      const res = await updateUser(currentUser?.id, userData);

      if (res.success) {
        setUserData({ ...currentUser, ...userData });
        router.back();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      Alert.alert(
        "Profile Update Error",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  let imageSource =
    user.image && typeof user.image == "object"
      ? user.image.uri
      : getUserImageSrc(user.image);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title={"Edit Profile"} />
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name={"camera"} size={20} strokeWidth={2.5} />
              </Pressable>
            </View>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Please fill your profile details
            </Text>
            <Input
              icon={<Icon name={"user"} />}
              placeholder="Enter your name"
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />
            <Input
              icon={<Icon name={"profile"} />}
              placeholder="Enter your userName"
              value={user.username}
              onChangeText={(value) => setUser({ ...user, username: value })}
            />
            <Input
              icon={<Icon name={"call"} />}
              placeholder="Enter your Phone Number"
              value={user.phoneNumber}
              onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
            />
            <Input
              icon={<Icon name={"location"} />}
              placeholder="Enter your address"
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />
            <Input
              icon={<Icon name={"instagram"} />}
              placeholder="Add your Instagram link"
              value={user.instagram}
              onChangeText={(value) => setUser({ ...user, instagram: value })}
            />
            <Input
              icon={<Icon name={"facebook"} />}
              placeholder="Add your Facebook link"
              value={user.facebook}
              onChangeText={(value) => setUser({ ...user, facebook: value })}
            />
            <Input
              icon={<Icon name={"linkedin"} />}
              placeholder="Add your Linkedin link"
              value={user.linkedin}
              onChangeText={(value) => setUser({ ...user, linkedin: value })}
            />
            <Input
              placeholder="Enter your bio"
              value={user.bio}
              multiline={true}
              containerStyle={styles.bio}
              onChangeText={(value) => setUser({ ...user, bio: value })}
            />
            <Button
              buttonSyle={{ marginBottom: 30 }}
              title={"Update"}
              loading={loading}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.grayLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
});
