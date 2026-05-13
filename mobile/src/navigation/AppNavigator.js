import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, UserCheck, Calendar, User, Rss } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import LeavesScreen from '../screens/LeavesScreen';
import FeedsScreen from '../screens/FeedsScreen';
import LeaveDetailsScreen from '../screens/LeaveDetailsScreen';
import ApplyLeaveScreen from '../screens/ApplyLeaveScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DirectoryScreen from '../screens/DirectoryScreen';
import RegularizeScreen from '../screens/RegularizeScreen';
import HolidaysScreen from '../screens/HolidaysScreen';
import ActivityScreen from '../screens/ActivityScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import BulkUploadScreen from '../screens/BulkUploadScreen';
import AttendanceReportScreen from '../screens/AttendanceReportScreen';
import WorkingHoursConfigScreen from '../screens/WorkingHoursConfigScreen';
import SuperAdminDashboardScreen from '../screens/SuperAdminDashboardScreen';
import RegisterOrganizationScreen from '../screens/RegisterOrganizationScreen';
// Placeholder screens for now


import { View, Text } from 'react-native';

const Placeholder = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{name} Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <LayoutDashboard size={size} color={color} />;
          if (route.name === 'Feeds') return <Rss size={size} color={color} />;
          if (route.name === 'Attendance') return <UserCheck size={size} color={color} />;
          if (route.name === 'Leaves') return <Calendar size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Feeds" component={FeedsScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Leaves" component={LeavesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterOrganization" component={RegisterOrganizationScreen} />
      <Stack.Screen name="Main" component={MainTabs} />

      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
      <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen} />
      <Stack.Screen name="Directory" component={DirectoryScreen} />
      <Stack.Screen name="Regularize" component={RegularizeScreen} />
      <Stack.Screen name="Holidays" component={HolidaysScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Stack.Screen name="BulkUpload" component={BulkUploadScreen} />
      <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} />
      <Stack.Screen name="WorkingHoursConfig" component={WorkingHoursConfigScreen} />
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
    </Stack.Navigator>

  );
};

export default AppNavigator;
