import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
      initialRouteName="login"
    >
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
        }}
      />
    </Stack>
  );
}