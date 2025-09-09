import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F0F0F',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#0F0F0F',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="clients" 
        options={{ 
          title: 'Clients',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="ai-design" 
        options={{ 
          title: 'AI Design',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="appointments" 
        options={{ 
          title: 'Appointments',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}