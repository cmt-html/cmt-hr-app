import React, { useMemo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import logoXml from '../assets/cloudmojo-logo-xml';

const VIEW_W = 122;
const VIEW_H = 22;

/**
 * Official CloudMojo wordmark. Icon colors match brand SVG; wordmark uses `wordmarkColor`.
 */
export default function CloudMojoLogo({
  width = 200,
  wordmarkColor = '#231F20',
  style,
  accessibilityLabel = 'CloudMojo',
}) {
  const height = (width * VIEW_H) / VIEW_W;
  const xml = useMemo(() => logoXml.replace(/#231F20/g, wordmarkColor), [wordmarkColor]);

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]} accessibilityLabel={accessibilityLabel}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}
