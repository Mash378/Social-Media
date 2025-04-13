import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

axios.defaults.withCredentials = true; // Ensure cookies are sent

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:3001/home'); // Replace with your machine’s IP
                if (res.status === 200) {
                    const username = res.data.replace("Hello, ", "").replace("!", "");
                    setUser(username);
                }
            } catch (error) {
                console.error("Not authenticated:", error);
                router.replace('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        console.log('Hello!')
        try {
            await axios.post('http://localhost:3001/logout');
            router.replace('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.title}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

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
        backgroundColor: '#ff4d4d',
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
