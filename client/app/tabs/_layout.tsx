import { View, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs,Link } from 'expo-router';
import {TabBar} from '@/components/TabBar';

export default function TabLayout() {
    return (
        <Tabs tabBar={props => <TabBar {...props} />}>
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile'
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    title: 'Upload'
                }}
            />
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                }}
            />
        </Tabs>
    );
}
