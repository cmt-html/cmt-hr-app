import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { navigationRef } from '../services/NavigationService';
import { LayoutDashboard, UserCheck, Calendar, User, Rss } from 'lucide-react-native';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import LoginScreen from '../screens/LoginScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import LeavesScreen from '../screens/LeavesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FeedsScreen from '../screens/FeedsScreen';
import ApplyLeaveScreen from '../screens/ApplyLeaveScreen';
import LeaveDetailsScreen from '../screens/LeaveDetailsScreen';
import DirectoryScreen from '../screens/DirectoryScreen';
import RegularizeScreen from '../screens/RegularizeScreen';
import HolidaysScreen from '../screens/HolidaysScreen';
import AddEmployeeScreen from '../screens/AddEmployeeScreen';
import BulkUploadScreen from '../screens/BulkUploadScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AttendanceReportScreen from '../screens/AttendanceReportScreen';
import WorkingHoursConfigScreen from '../screens/WorkingHoursConfigScreen';
import SuperAdminDashboardScreen from '../screens/SuperAdminDashboardScreen';
import RegisterOrganizationScreen from '../screens/RegisterOrganizationScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 10 },
        tabBarActiveTintColor: '#6366f1',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Feeds" 
        component={FeedsScreen}
        options={{ tabBarIcon: ({ color }) => <Rss color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ tabBarIcon: ({ color }) => <UserCheck color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Leaves" 
        component={LeavesScreen} 
        options={{ tabBarIcon: ({ color }) => <Calendar color={color} size={24} /> }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [loading, setLoading] = React.useState(true);
  const [initialRoute, setInitialRoute] = React.useState('Login');

  React.useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) setInitialRoute('Main');
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterOrganization" component={RegisterOrganizationScreen} />
      <Stack.Screen name="Main" component={MainTabs} />

      {/* Inner Screens */}
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
      <Stack.Screen name="LeaveDetails" component={LeaveDetailsScreen} />
      <Stack.Screen name="Directory" component={DirectoryScreen} />
      <Stack.Screen name="Regularize" component={RegularizeScreen} />
      <Stack.Screen name="Holidays" component={HolidaysScreen} />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
      <Stack.Screen name="BulkUpload" component={BulkUploadScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AttendanceReport" component={AttendanceReportScreen} />
      <Stack.Screen name="WorkingHoursConfig" component={WorkingHoursConfigScreen} />
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
