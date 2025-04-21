// app/create-battle.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { ThemedText } from '@/components/ThemedText';

// Define interfaces for our data types
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

interface Battle {
    _id: string;
    video1: string;
    video2: string;
    tag: string;
}

export default function CreateBattleScreen() {
    const router = useRouter();
    const { videoId } = useLocalSearchParams();
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [potentialOpponents, setPotentialOpponents] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creatingBattle, setCreatingBattle] = useState(false);

    useEffect(() => {
        if (videoId) {
            fetchVideoData();
        }
    }, [videoId]);

    const fetchVideoData = async () => {
        setLoading(true);
        try {
            // Fetch the selected video details
            const videoRes = await axios.get<Video>(
                `http://localhost:3001/api/videos/${videoId}`,
                { withCredentials: true }
            );
            setSelectedVideo(videoRes.data);

            // Fetch potential opponents (videos with matching tags)
            const opponentsRes = await axios.get<Video[]>(
                `http://localhost:3001/api/videos/potential-opponents/${videoId}`,
                { withCredentials: true }
            );
            setPotentialOpponents(opponentsRes.data);
        } catch (error) {
            console.error('Error fetching video data:', error);
            setError('Failed to load video data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const createBattle = async (opponentId: string) => {
        if (!selectedVideo || !videoId) return;

        setCreatingBattle(true);
        try {
            // Find a common tag between the two videos
            const selectedVideoTags = selectedVideo.tags;
            const opponent = potentialOpponents.find(video => video._id === opponentId);

            if (!opponent) {
                setError('Opponent video not found');
                setCreatingBattle(false);
                return;
            }

            const opponentTags = opponent.tags;

            // Find first matching tag
            const commonTag = selectedVideoTags.find(tag => opponentTags.includes(tag));

            if (!commonTag) {
                setError('No common tag found between these videos');
                setCreatingBattle(false);
                return;
            }

            // Create the battle
            const response = await axios.post<Battle>(
                'http://localhost:3001/api/battles',
                {
                    video1Id: videoId,
                    video2Id: opponentId,
                    tag: commonTag
                },
                { withCredentials: true }
            );

            // Navigate to the battle screen
            router.replace({
                pathname: '/battle',
                params: { battleId: response.data._id }
            });
        } catch (error) {
            console.error('Error creating battle:', error);
            setError('Failed to create battle. Please try again.');
        } finally {
            setCreatingBattle(false);
        }
    };

    const renderOpponentItem = ({ item }: { item: Video }) => (
        <View style={styles.opponentItem}>
            <View style={styles.opponentInfo}>
                <View style={styles.thumbnailContainer}>
                    <Image
                        source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/80x120' }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.opponentDetails}>
                    <ThemedText style={styles.opponentTitle}>{item.title}</ThemedText>
                    <View style={styles.tagContainer}>
                        {item.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => createBattle(item._id)}
                disabled={creatingBattle}
            >
                {creatingBattle ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <ThemedText style={styles.selectButtonText}>Select</ThemedText>
                )}
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#00d4ff" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.backText}>← Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>Create Battle</ThemedText>
                        <View style={{ width: 50 }} />
                    </View>

                    {error ? (
                        <ThemedText style={styles.errorText}>{error}</ThemedText>
                    ) : null}

                    {selectedVideo && (
                        <View style={styles.selectedVideoContainer}>
                            <ThemedText style={styles.sectionTitle}>Your Video</ThemedText>
                            <View style={styles.selectedVideo}>
                                <View style={styles.thumbnailContainer}>
                                    <Image
                                        source={{ uri: selectedVideo.thumbnailUrl || 'https://via.placeholder.com/80x120' }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                </View>
                                <View style={styles.videoDetails}>
                                    <ThemedText style={styles.videoTitle}>{selectedVideo.title}</ThemedText>
                                    <View style={styles.tagContainer}>
                                        {selectedVideo.tags.map((tag, index) => (
                                            <View key={index} style={styles.tag}>
                                                <ThemedText style={styles.tagText}>#{tag}</ThemedText>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    <ThemedText style={styles.sectionTitle}>Select an Opponent</ThemedText>
                    {potentialOpponents.length > 0 ? (
                        <FlatList
                            data={potentialOpponents}
                            renderItem={renderOpponentItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.opponentsList}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>
                                No potential opponents found. Opponents must share at least one tag with your video.
                            </ThemedText>
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => router.push('/upload')}
                            >
                                <ThemedText style={styles.uploadButtonText}>Upload More Videos</ThemedText>
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
    errorText: {
        color: '#ff4d4d',
        marginBottom: 15,
        textAlign: 'center',
    },
    selectedVideoContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    selectedVideo: {
        flexDirection: 'row',
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        padding: 12,
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
    videoDetails: {
        flex: 1,
        marginLeft: 12,
    },
    videoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    opponentsList: {
        paddingBottom: 20,
    },
    opponentItem: {
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    opponentInfo: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    opponentDetails: {
        flex: 1,
        marginLeft: 12,
    },
    opponentTitle: {
        fontSize: 16,
        marginBottom: 6,
    },
    selectButton: {
        backgroundColor: '#00d4ff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 6,
        alignSelf: 'center',
    },
    selectButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
    },
    uploadButton: {
        backgroundColor: '#00d4ff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    uploadButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
});