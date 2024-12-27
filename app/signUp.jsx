import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Input from "../components/Input";
import Icon from "../assets/icons";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const generateUsername = async (name) => {
    if (!name) return `user_${Date.now()}`;

    let baseUsername = name.trim().toLowerCase().replace(/\s+/g, "_");
    let uniqueUsername = baseUsername;

    let counter = 0;
    let isUnique = false;

    while (!isUnique) {
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("username", uniqueUsername);

      if (error) {
        throw new Error("Error checking username availability");
      }

      if (data.length === 0) {
        isUnique = true; // Username is unique
      } else {
        counter++;
        uniqueUsername = `${baseUsername}_${counter}`;
      }
    }

    return uniqueUsername;
  };

  const onSubmit = async () => {
    if (!nameRef || !emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "please fill all the details");
    }
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    try {
      // Step 1: Sign Up the User
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Add name to metadata
          },
        },
      });

      if (error) {
        throw error;
      }

      const user = data?.user;
      if (!user) {
        throw new Error("User not created");
      }

      // Step 2: Generate a Unique Username
      const username = await generateUsername(name);

      // Step 3: Update the User in the Database with the Unique Username
      const { error: updateError } = await supabase
        .from("users")
        .update({ username })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

    } catch (error) {
      Alert.alert(
        "Sign Up Error",
        error.message || "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg={"white"}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />
        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>
        {/* form */}
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please fill the details to create an account
          </Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Button title={"Sign up"} loading={loading} onPress={onSubmit} />
          {/* footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              onPress={() => {
                router.push("login");
              }}
            >
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.colors.primaryDark,
                    fontWeight: theme.fonts.semibold,
                  },
                ]}
              >
                Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
