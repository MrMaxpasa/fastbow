// src/components/HexLoader.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface GelProps {
  left: number;
  top: number;
  delay: number;
  accentColor: string;
}

function HexGel({ left, top, delay, accentColor }: GelProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const color = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.01,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const fade = Animated.loop(
      Animated.sequence([
        Animated.timing(color, {
          toValue: 1,
          duration: 1000,
          delay,
          useNativeDriver: false,
        }),
        Animated.timing(color, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    pulse.start();
    fade.start();

    return () => {
      pulse.stop();
      fade.stop();
    };
  }, []);

  const bgColor = color.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#252525', accentColor, '#353535'],
  });

  const brickStyle = {
    width: 30,
    height: 17,
    position: 'absolute' as const,
    top: 5,
    backgroundColor: bgColor,
  };

  return (
    <Animated.View
      style={[
        styles.gel,
        {
          left: 100 + left,
          top: 100 + top,
          transform: [{ scale }],
        },
      ]}
    >
      <Animated.View style={brickStyle} />
      <Animated.View style={[brickStyle, { transform: [{ rotate: '60deg' }] }]} />
      <Animated.View style={[brickStyle, { transform: [{ rotate: '-60deg' }] }]} />
    </Animated.View>
  );
}

interface HexLoaderProps {
  accentColor?: string;
  size?: number;
}

export default function HexLoader({ accentColor = '#7c6ef5', size = 200 }: HexLoaderProps) {
  const gels: [number, number, number][] = [
    // center
    [-15, -15, 0],
    // r1 (delay 0.2s)
    [-47, -15, 200], [-31, -43, 200], [1, -43, 200],
    [17, -15, 200], [-31, 13, 200], [1, 13, 200],
    // r2 (delay 0.4s)
    [-63, -43, 400], [33, -43, 400], [-15, 41, 400],
    [-63, 13, 400], [33, 13, 400], [-15, -71, 400],
    [-47, -71, 400], [17, -71, 400], [-47, 41, 400],
    [17, 41, 400], [-79, -15, 400], [49, -15, 400],
    // r3 (delay 0.6s)
    [-63, -99, 600], [33, -99, 600], [1, -99, 600],
    [-31, -99, 600], [-63, 69, 600], [33, 69, 600],
    [1, 69, 600], [-31, 69, 600], [-95, -43, 600],
    [-95, 13, 600], [49, 41, 600], [-79, -71, 600],
    [-111, -15, 600], [65, -43, 600], [65, 13, 600],
    [-79, 41, 600], [49, -71, 600], [81, -15, 600],
  ];

  return (
    <View style={[styles.socket, { width: size, height: size }]}>
      {gels.map(([left, top, delay], i) => (
        <HexGel
          key={i}
          left={left}
          top={top}
          delay={delay}
          accentColor={accentColor}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  socket: {
    position: 'relative',
    overflow: 'visible',
  },
  gel: {
    width: 30,
    height: 30,
    position: 'absolute',
  },
});
