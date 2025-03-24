import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing token or session info

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    // Retrieve user session or token when component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                if (storedUsername) {
                    setUser(storedUsername);
                }
            } catch (err) {
                console.log('Error fetching user session:', err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('username'); // Remove user session
            router.replace('/login'); // Redirect to login screen
        } catch (err) {
            console.log('Error logging out:', err);
        }
    };

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.title}>Welcome, {user || 'Guest'}!</Text>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#ff4d4d', // Red color for logout
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
