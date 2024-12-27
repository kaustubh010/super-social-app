export default {
  expo: {
    name: "Samidha",
    slug: "super-social-app",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/samidha.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/samidha.png",
        backgroundColor: "#ffffff",
      },
      package: "com.kaustubh010.supersocialapp",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/samidha.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/samidha.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "62f607e0-c254-4990-97ff-87fd88ef9864",
      },
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    owner: "kaustubh010",
  },
};
