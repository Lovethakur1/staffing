import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme';

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_CONFIG: Record<string, { label: string; icon: IconName; activeIcon: IconName }> = {
  Dashboard: { label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  MyShifts: { label: 'Shifts', icon: 'calendar-outline', activeIcon: 'calendar' },
  Inbox: { label: 'Inbox', icon: 'chatbubble-outline', activeIcon: 'chatbubble' },
  Profile: { label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 10 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || { label: route.name, icon: 'ellipse-outline', activeIcon: 'ellipse' };

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

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            {/* Active indicator */}
            {isFocused && <View style={styles.activeIndicator} />}

            <Ionicons
              name={isFocused ? config.activeIcon : config.icon}
              size={24}
              color={isFocused ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 3,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
