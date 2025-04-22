import { Feather } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable, Text } from "@react-navigation/elements";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import React from "react";
import { Text as RNText, StyleSheet, View } from "react-native";

const icons: Record<
  "home" | "profile" | "upload",
  (props: { color: string }) => JSX.Element
> = {
  home: (p) => <Feather name="home" size={24} {...p} />,
  profile: (p) => <Feather name="user" size={24} {...p} />,
  upload: (p) => <Feather name="upload" size={24} {...p} />,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
        const label = typeof rawLabel === "string" ? rawLabel : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const evt = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !evt.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () =>
          navigation.emit({ type: "tabLongPress", target: route.key });

        const Icon =
          icons[route.name as keyof typeof icons] ?? (() => <RNText>?</RNText>);

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            <Icon color={isFocused ? "white" : "white"} />
            <Text style={{ color: isFocused ? colors.primary : colors.text }}>
              {label}
            </Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
    bottom: 0,
    left: "40%",
    right: "40%",
    paddingVertical: 15,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
  tabbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
