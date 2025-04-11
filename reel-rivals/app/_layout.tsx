import { Stack } from 'expo-router';
import {useColorScheme, View} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#000' },
                    animation: 'fade',
                }}
            />
        </View>
    );
}