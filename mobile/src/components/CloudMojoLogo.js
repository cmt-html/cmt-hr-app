import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import logoXml from '../assets/cloudmojo-logo-xml';

/**
 * CMT overlapping-circles cloud logo — used in Login, Profile, and nav headers.
 * Square aspect ratio (1:1). Pass `size` to control both width and height.
 */
export default function CloudMojoLogo({
  size = 48,
  style,
  accessibilityLabel = 'CloudMojo',
}) {
  return (
    <View
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      <SvgXml xml={logoXml} width={size} height={size} />
    </View>
  );
}
