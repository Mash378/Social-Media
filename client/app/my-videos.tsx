// app/my-videos.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { ThemedText } from '@/components/ThemedText';

// Define the Video interface
interface Video {
    _id: string;
    title: string;
    description?: string;
    url: string;
    thumbnailUrl?: string;
    tags: string[];
    uploadedAt: string;
    uploaderId: string;
    views: number;
    votes: number;
    status: "active" | "deleted";
}

export default function MyVideosScreen() {
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyVideos();
    }, []);

    const fetchMyVideos = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Video[]>('http://localhost:3001/api/videos/my-videos', {
                withCredentials: true
            });
            setVideos(response.data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const createBattle = async (videoId: string) => {
        router.push({
            pathname: '/create-battle',
            params: { videoId }
        });
    };

    const renderVideoItem = ({ item }: { item: Video }) => (
        <View style={styles.videoItem}>
            {/* Video thumbnail */}
            <View style={styles.thumbnailContainer}>
                <Image
                    source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/120x180' }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
            </View>

            {/* Video info */}
            <View style={styles.videoInfo}>
                <ThemedText style={styles.videoTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.videoMeta}>
                    {item.views} views • {new Date(item.uploadedAt).toLocaleDateString()}
                </ThemedText>
                <View style={styles.tagContainer}>
                    {item.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                        </View>
                    ))}
                </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
                style={styles.battleButton}
                onPress={() => createBattle(item._id)}
            >
                <ThemedText style={styles.battleButtonText}>Battle</ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.backText}>← Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>My Videos</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/upload')}>
                            <ThemedText style={styles.uploadText}>Upload</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#00d4ff" />
                        </View>
                    ) : videos.length > 0 ? (
                        <FlatList
                            data={videos}
                            renderItem={renderVideoItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.videosList}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>You haven't uploaded any videos yet</ThemedText>
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => router.push('/upload')}
                            >
                                <ThemedText style={styles.uploadButtonText}>Upload Your First Video</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
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
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backText: {
        fontSize: 16,
        color: '#888',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    uploadText: {
        fontSize: 16,
        color: '#00d4ff',
    },
    videosList: {
        paddingBottom: 20,
    },
    videoItem: {
        flexDirection: 'row',
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    thumbnailContainer: {
        width: 80,
        height: 120,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    videoInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    videoMeta: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 6,
    },
    tag: {
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#00d4ff',
    },
    battleButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginLeft: 'auto',
    },
    battleButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
    },
    uploadButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
    },
    uploadButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
});