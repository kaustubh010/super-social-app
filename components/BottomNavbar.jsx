import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Icon from "../assets/icons";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import Avatar from "./Avatar";
import { hp } from "../helpers/common";

const BottomNavbar = ({ user }) => {
  const router = useRouter();

  return (
    <View style={{alignItems: 'center'} }>
      {/* Bottom Navbar */}
      <View style={styles.bottomNavbar}>
        <Pressable onPress={() => router.push("/home")} style={styles.navIcon}>
          <Icon name={"home"} size={24} color="black" />
        </Pressable>
        <Pressable
          onPress={() => router.push("/newPost")}
          style={styles.navIcon}
        >
          <Icon name={"plus"} size={24} color="black" />
        </Pressable>
        <Pressable
          onPress={() => router.push("/search")}
          style={styles.navIcon}
        >
          <Icon name={"search"} size={24} color="black" />
        </Pressable>
        <Pressable onPress={() => router.push("profile")}>
          <Avatar
            uri={user?.image}
            size={hp(4.3)}
            rounded={theme.radius.sm}
            style={{ borderWidth: 2 }}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Bottom Navbar Styles
  bottomNavbar: {
    position: "absolute",
    borderRadius: theme.radius.xxl,
    bottom: 2,
    width: "95%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",  // Semi-transparent white background
    backdropFilter: "blur(10px)",  // Apply blur effect to make it look like frosted glass
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 56,
    borderWidth: 1,  // Optional: adds a border for a more defined look
    borderColor: "rgba(255, 255, 255, 0.3)",  // Subtle border color to enhance the glass effect
    shadowColor: "#000",  // Optional: add shadow for a glossy effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
},
  navIcon: {
    alignItems: "center",
  },
});

export default BottomNavbar;
