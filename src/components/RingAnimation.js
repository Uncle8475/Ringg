import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import { useTheme } from '../theme';

export default function RingAnimation({size = 140, glow = false}) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {toValue: 1.03, duration: 900, useNativeDriver: true}),
        Animated.timing(scale, {toValue: 0.97, duration: 900, useNativeDriver: true})
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [scale]);

  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      {glow && (
        <View
          style={[
            styles.glow,
            {
              width: size * 1.4,
              height: size * 1.4,
              borderRadius: (size * 1.4) / 2,
              backgroundColor: theme.secondary,
            }
          ]}
        />
      )}
      <Animated.View style={{transform: [{scale}]}}>
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: theme.secondary,
            }
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 6, backgroundColor: 'transparent' },
  glow: { position: 'absolute', opacity: 0.12 },
});
