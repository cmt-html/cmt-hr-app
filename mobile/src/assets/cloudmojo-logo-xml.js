/**
 * CMT overlapping-circles cloud logo — matches web frontend Logo.jsx.
 * Three overlapping circles: cyan/teal on top, blue bottom-left, deep blue bottom-right.
 */
export default `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cmt-top" x1="50" y1="12" x2="50" y2="68" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#00a3ff"/>
    </linearGradient>
    <linearGradient id="cmt-left" x1="16" y1="42" x2="68" y2="94" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0072ff"/>
      <stop offset="100%" stop-color="#0033ff"/>
    </linearGradient>
    <linearGradient id="cmt-right" x1="32" y1="42" x2="84" y2="94" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0047ff"/>
      <stop offset="100%" stop-color="#001aff"/>
    </linearGradient>
  </defs>
  <circle cx="38" cy="60" r="26" fill="url(#cmt-left)"/>
  <circle cx="62" cy="60" r="26" fill="url(#cmt-right)"/>
  <circle cx="50" cy="38" r="26" fill="url(#cmt-top)" opacity="0.9"/>
</svg>`;
