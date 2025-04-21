import { Stack } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    const colorScheme = useColorScheme(); // Using the colorScheme value for customization

    return (
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent={true} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' },
                    animation: 'fade',
                }}
            >
                <Stack.Screen name="tabs" options={{ headerShown: false }} />
            </Stack>
        </View>
    );
}
