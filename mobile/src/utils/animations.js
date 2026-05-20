import { Animated, Easing } from 'react-native';

/**
 * Creates a staggered entrance animation for a list of Animated.Values.
 * Each item fades in and slides up with a delay offset.
 * @param {Array<{opacity: Animated.Value, translateY: Animated.Value}>} items
 * @param {number} staggerDelay  ms between each item
 * @param {number} duration      ms per animation
 */
export const staggerEntrance = (items, staggerDelay = 80, duration = 400) => {
  const animations = items.map(({ opacity, translateY }, index) =>
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay: index * staggerDelay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ])
  );
  Animated.parallel(animations).start();
};

/**
 * Returns a new {opacity, translateY} pair with translateY pre-set to initialY.
 * @param {number} initialY  Starting Y offset (positive = starts below)
 */
export const makeEntranceValues = (initialY = 30) => ({
  opacity: new Animated.Value(0),
  translateY: new Animated.Value(initialY),
});

/**
 * Press-in / press-out scale effect for a button.
 * Pass the Animated.Value and call pressIn / pressOut from your handlers.
 */
export const makePressScale = (minScale = 0.95) => {
  const scale = new Animated.Value(1);
  const pressIn = () =>
    Animated.spring(scale, {
      toValue: minScale,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  return { scale, pressIn, pressOut };
};

/**
 * Slide-in from right animation for detail panels.
 */
export const slideInFromRight = (translateX, duration = 300) => {
  translateX.setValue(60);
  Animated.timing(translateX, {
    toValue: 0,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  }).start();
};

/**
 * Fade-in animation.
 */
export const fadeIn = (opacity, duration = 250) => {
  opacity.setValue(0);
  Animated.timing(opacity, {
    toValue: 1,
    duration,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  }).start();
};
