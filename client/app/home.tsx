import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';

// Define interfaces for our data types
interface Video {
    _id: string;
    title: string;
    url: string;
    thumbnailUrl?: string;
}

interface Battle {
    _id: string;
    tag: string;
    video1: Video;
    video2: Video;
    active: boolean;
    startedAt: string;
    endsAt: string;
    video1Votes: number;
    video2Votes: number;
}

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    const [battles, setBattles] = useState<Battle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserAndBattles();
    }, []);

    const fetchUserAndBattles = async () => {
        setLoading(true);
        try {
            // Fetch user data
            const userRes = await axios.get<string>('http://localhost:3001/home', {
                withCredentials: true
            });

            if (userRes.status === 200) {
                const username = userRes.data.replace("Hello, ", "").replace("!", "");
                setUser(username);
            }

            // Fetch active battles
            const battlesRes = await axios.get<Battle[]>('http://localhost:3001/api/battles/active', {
                withCredentials: true
            });

            if (battlesRes.status === 200) {
                setBattles(battlesRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            router.replace('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3001/logout');
            router.replace('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderBattleItem = ({ item }: { item: Battle }) => (
        <TouchableOpacity
            style={styles.battleItem}
            onPress={() => router.push({
                pathname: '/battle',
                params: { battleId: item._id }
            })}
        >
            <Text style={styles.battleTag}>#{item.tag}</Text>
            <View style={styles.battleVideos}>
                <Text style={styles.videoTitle} numberOfLines={1}>{item.video1.title}</Text>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.videoTitle} numberOfLines={1}>{item.video2.title}</Text>
            </View>
        </TouchableOpacity>
    );

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

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={() => router.push('/upload')}
                        >
                            <Text style={styles.uploadButtonText}>Upload Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.myVideosButton}
                            onPress={() => router.push('/my-videos')}
                        >
                            <Text style={styles.myVideosButtonText}>My Videos</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Active Battles</Text>

                    {battles.length > 0 ? (
                        <FlatList
                            data={battles}
                            renderItem={renderBattleItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.battlesList}
                        />
                    ) : (
                        <View style={styles.noBattlesContainer}>
                            <Text style={styles.noBattlesText}>No active battles found.</Text>
                            <Text style={styles.noBattlesSubtext}>Upload videos to create your own battles!</Text>
                        </View>
                    )}

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
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    uploadButton: {
        backgroundColor: '#00d4ff',
        borderRadius: 8,
        padding: 15,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    myVideosButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 15,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    myVideosButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
    },
    battlesList: {
        paddingBottom: 20,
    },
    battleItem: {
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
    },
    battleTag: {
        color: '#00d4ff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    battleVideos: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    videoTitle: {
        color: '#FFF',
        fontSize: 14,
        flex: 1,
    },
    vsText: {
        color: '#888',
        fontSize: 14,
        marginHorizontal: 10,
        fontWeight: 'bold',
    },
    noBattlesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    noBattlesText: {
        color: '#888',
        fontSize: 18,
        marginBottom: 10,
    },
    noBattlesSubtext: {
        color: '#666',
        fontSize: 14,
    },
    logoutButton: {
        backgroundColor: '#ff4d4d',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});