import { View, Platform, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import {router} from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons'
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import {BottomTabBarButtonProps, BottomTabBarProps, createBottomTabNavigator} from '@react-navigation/bottom-tabs';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const icon ={
    home: (props: any) => <Feather name="home" size={24} {...props} />,
    profile: (props: any) => <Feather name='user' size={24} {...props} />,
    upload: (props: any) => <Feather name='upload' size={24} {...props} />,
  }
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.tabbar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key = {route.name}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {icon[route.name]({
              color: isFocused ? "white" : "white"
            })}
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
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey',
    bottom: 0,
    left: '40%',
    right: '40%',
    paddingVertical: 15,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 10,
    shadowOpacity: 0.1
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})