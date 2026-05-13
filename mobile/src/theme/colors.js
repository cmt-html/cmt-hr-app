export const LightTheme = {
  primary: '#6366F1', // Electric Indigo
  secondary: '#0EA5E9', // Sky Blue
  accent: '#4F46E5',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A', // Slate 900
  textLight: '#64748B', // Slate 500
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  card: '#FFFFFF',
  
  primaryGradient: ['#6366F1', '#4F46E5'],
  successGradient: ['#10B981', '#059669'],
  warningGradient: ['#F59E0B', '#D97706'],
  surfaceGradient: ['#FFFFFF', '#F1F5F9'],
  
  glassSurface: 'rgba(255, 255, 255, 0.8)',
  
  shadow: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
};

export const DarkTheme = {
  primary: '#818CF8', // Soft Indigo
  secondary: '#38BDF8', // Soft Sky
  accent: '#6366F1',
  background: '#000000',
  surface: '#0F172A', // Deep Slate
  text: '#F8FAFC',
  textLight: '#94A3B8',
  border: '#1E293B',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  white: '#FFFFFF',
  black: '#000000',
  card: '#1E293B',
  
  primaryGradient: ['#1E293B', '#0F172A'],
  successGradient: ['#065F46', '#10B981'],
  warningGradient: ['#92400E', '#F59E0B'],
  surfaceGradient: ['#0F172A', '#000000'],
  
  glassSurface: 'rgba(30, 41, 59, 0.7)',
  
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
};

export const Colors = LightTheme; // Fallback
