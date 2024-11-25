import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";
import WeatherView from "@/components/weatherView";
const STYLES = ["default", "dark-content", "light-content"] as const;
const TRANSITIONS = ["fade", "slide", "none"] as const;

export default function HomeScreen() {
  const [hidden, setHidden] = useState(false);
  const [statusBarStyle, setStatusBarStyle] = useState<StatusBarStyle>(
    STYLES[0]
  );
  const [statusBarTransition, setStatusBarTransition] = useState<
    "fade" | "slide" | "none"
  >(TRANSITIONS[0]);

  const changeStatusBarVisibility = () => setHidden(!hidden);

  const changeStatusBarStyle = () => {
    const styleId = STYLES.indexOf(statusBarStyle) + 1;
    if (styleId === STYLES.length) {
      setStatusBarStyle(STYLES[0]);
    } else {
      setStatusBarStyle(STYLES[styleId]);
    }
  };

  const changeStatusBarTransition = () => {
    const transition = TRANSITIONS.indexOf(statusBarTransition) + 1;
    if (transition === TRANSITIONS.length) {
      setStatusBarTransition(TRANSITIONS[0]);
    } else {
      setStatusBarTransition(TRANSITIONS[transition]);
    }
  };

  return (
    <SafeAreaView style={styles.stepContainer}>
      <StatusBar
        animated={true}
        backgroundColor="black"
        barStyle={statusBarStyle}
        showHideTransition={statusBarTransition}
        hidden={hidden}
      />
      <WeatherView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    flex: 1,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
