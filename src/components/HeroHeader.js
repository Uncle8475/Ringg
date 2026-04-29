import React, { useEffect, useMemo, useRef } from 'react';
import { View as RNView, StyleSheet, Animated, Image } from 'react-native';
import { Text } from '../uikit';
import { useTheme } from '../theme';

const HEADER_HEIGHT = 132;
const ringImage = require('../../assets/images/logo.jpg');

export default function HeroHeader({ greeting, timeState, reduceMotion, scrollY }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const fade = useRef(new Animated.Value(1)).current;
  const skyDrift = useRef(new Animated.Value(0)).current;
  const orb = useRef(new Animated.Value(0)).current;
  const ringTilt = useRef(new Animated.Value(0)).current;
  const starTwinkles = useRef(Array.from({length:4}).map(()=>new Animated.Value(0))).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;

  // Collapse animation constants
  const HEADER_EXPANDED = 140;
  const HEADER_COLLAPSED = 0;
  const SCROLL_RANGE = 100; // Scroll distance over which to collapse header

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {toValue: 1, duration: 650, useNativeDriver: true}).start();
  }, [timeState.key, fade]);

  useEffect(() => {
    if (reduceMotion) {
      emojiAnim.setValue(1);
      return;
    }
    emojiAnim.setValue(0);
    Animated.timing(emojiAnim, {toValue: 1, duration: 350, useNativeDriver: true}).start();
  }, [emojiAnim, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    const skyLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(skyDrift, {toValue: 1, duration: 9000, useNativeDriver: true}),
        Animated.timing(skyDrift, {toValue: 0, duration: 9000, useNativeDriver: true}),
      ])
    );

    const orbLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(orb, {toValue: 1, duration: 7000, useNativeDriver: true}),
        Animated.timing(orb, {toValue: 0, duration: 7000, useNativeDriver: true}),
      ])
    );

    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ringTilt, {toValue: 1, duration: 5000, useNativeDriver: true}),
        Animated.timing(ringTilt, {toValue: 0, duration: 5000, useNativeDriver: true}),
      ])
    );

    const twinkleLoops = starTwinkles.map((anim, idx) => Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {toValue: 1, duration: 1600 + idx * 400, useNativeDriver: true}),
        Animated.timing(anim, {toValue: 0, duration: 1600 + idx * 400, useNativeDriver: true}),
      ])
    ));

    skyLoop.start();
    orbLoop.start();
    tiltLoop.start();
    twinkleLoops.forEach(loop => loop.start());

    return () => {
      skyLoop.stop();
      orbLoop.stop();
      tiltLoop.stop();
      twinkleLoops.forEach(loop => loop.stop());
    };
  }, [reduceMotion, skyDrift, orb, ringTilt, starTwinkles]);

  const scene = {
    accent: theme.colors.secondary,
    orbDrift: [-6, 6],
  };
  const ringRotate = ringTilt.interpolate({inputRange: [0, 1], outputRange: ['-2deg', '2deg']});
  const ringTranslate = ringTilt.interpolate({inputRange: [0, 1], outputRange: [2, -2]});

  const orbTranslateY = orb.interpolate({inputRange: [0, 1], outputRange: scene.orbDrift});
  const skyShift = skyDrift.interpolate({inputRange: [0, 1], outputRange: [0, -6]});
  const emojiScale = emojiAnim.interpolate({inputRange: [0, 1], outputRange: [0.95, 1.0]});

  // Scroll-based animations for collapsing header
  const headerTranslateY = scrollY ? scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [0, -HEADER_EXPANDED],
    extrapolate: 'clamp',
  }) : 0;

  const contentOpacity = scrollY ? scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) : 1;

  const greetingScale = scrollY ? scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  }) : 1;

  const ringScale = scrollY ? scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  }) : 1;

  const hazeFade = scrollY ? scrollY.interpolate({
    inputRange: [0, SCROLL_RANGE],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  }) : 1;

  const isNight = timeState.key === 'night';

  return (
    <Animated.View
      style={[
        styles.container,
        { height: HEADER_EXPANDED, transform: [{ translateY: headerTranslateY }] }
      ]}
      accessibilityRole="header"
    >
      <Animated.View style={[styles.gradientWrap, { opacity: fade }]}>
        <Animated.View
          style={[styles.solidBackground, { transform: [{ translateY: skyShift }] }]}
          pointerEvents="none"
        />
      </Animated.View>

      <RNView style={styles.overlayLayer} pointerEvents="none">
        {!isNight && (
          <Animated.View
            style={[
              styles.orb,
              { backgroundColor: scene.accent, opacity: Animated.multiply(contentOpacity, 0.35), transform: [{ translateY: orbTranslateY }] }
            ]}
          />
        )}

        {isNight && (
          <>
            <Animated.View
              style={[
                styles.moon,
                { borderColor: scene.accent, opacity: Animated.multiply(contentOpacity, 0.65), transform: [{ translateY: orbTranslateY }] }
              ]}
            />
            {starTwinkles.map((a, idx) => {
              const opacity = a.interpolate({inputRange:[0,1], outputRange:[0.25,0.9]});
              const scale = a.interpolate({inputRange:[0,1], outputRange:[0.9,1.1]});
              const positions = [
                {top: 18, left: 36},
                {top: 32, left: 120},
                {top: 20, right: 48},
                {top: 54, right: 96},
              ];
              const pos = positions[idx] || {top: 40, left: 80};
              return (
                <Animated.View
                  key={idx}
                  style={[
                    styles.star,
                    pos,
                    { opacity: Animated.multiply(opacity, contentOpacity), transform: [{ scale }] }
                  ]}
                />
              );
            })}
          </>
        )}
      </RNView>

      <Animated.View style={[styles.content, {opacity: contentOpacity}]}>
        <RNView style={styles.textBlock}>
          <RNView style={styles.greetingRow}>
            <Animated.Text
              style={[
                styles.greeting,
                { transform: [{ scale: greetingScale }] }
              ]}
            >
              {greeting}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.emoji,
                { opacity: emojiAnim, transform: [{ scale: Animated.multiply(emojiScale, greetingScale) }] }
              ]}
            >
              {timeState.emoji}
            </Animated.Text>
          </RNView>
          <Animated.Text style={[styles.subtext, { opacity: contentOpacity }]}>COSMIC Ring is ready</Animated.Text>
        </RNView>

        <Animated.View
          style={[
            styles.ringWrap,
            { transform: reduceMotion ? [{ scale: ringScale }] : [{ scale: ringScale }, { rotate: ringRotate }, { translateY: ringTranslate }] }
          ]}
        >
          <Image source={ringImage} style={styles.ring} resizeMode="contain" />
        </Animated.View>
      </Animated.View>

      <RNView style={styles.bottomDivider} />
    </Animated.View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 24,
  },
  gradientWrap: { ...StyleSheet.absoluteFillObject },
  solidBackground: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: theme.colors.primary,
  },
  overlayLayer: { 
    ...StyleSheet.absoluteFillObject, 
    paddingHorizontal: 20, 
    paddingTop: 18 
  },
  orb: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    alignSelf: 'flex-start', 
    marginTop: 8,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  moon: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    borderWidth: 3, 
    alignSelf: 'flex-start', 
    marginTop: 12,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  star: { 
    position: 'absolute', 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: theme.colors.textOnDark,
    shadowColor: theme.colors.textOnDark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  content: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 22, 
    paddingTop: 18 
  },
  textBlock: { 
    flex: 1, 
    paddingRight: 16 
  },
  greetingRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  greeting: { 
    fontSize: 26, 
    fontWeight: '900', 
    letterSpacing: 0.5, 
    color: theme.colors.textOnDark,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  emoji: { 
    fontSize: 26, 
    marginLeft: 10, 
    color: theme.colors.textOnDark,
  },
  subtext: { 
    marginTop: 14, 
    fontSize: 15, 
    fontWeight: '700', 
    color: theme.colors.textOnDark,
    opacity: 0.95,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ringWrap: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: `${theme.colors.secondary}60`,
    backgroundColor: `${theme.colors.primary}DD`,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 20,
  },
  ring: { 
    width: 62, 
    height: 62, 
    borderRadius: 18 
  },
  bottomDivider: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 4,
    backgroundColor: `${theme.colors.secondary}50`,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
});
