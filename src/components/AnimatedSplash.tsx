// src/components/AnimatedSplash.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import HexLoader from './HexLoader';

const { width, height } = Dimensions.get('screen');

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: Props) {
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => StatusBar.setHidden(false);
  }, []);

  useEffect(() => {
    Animated.sequence([
      // Texto aparece
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Loader aparece
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Espera visible
      Animated.delay(800),
      // Fade out de toda la pantalla
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        FASTBOW
      </Animated.Text>
      <Animated.View style={{ opacity: loaderOpacity, marginTop: 40 }}>
        <HexLoader accentColor="#7c6ef5" size={200} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    bottom: -50,
    backgroundColor: '#0f0f14',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#f0f0f5',
    marginTop: 20,
  },
});
