// client/app/battle.tsx
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { ThemedText } from '@/components/ThemedText';
import { castVote } from '@/api';
import { Battle } from '@/types';

export default function BattleScreen() {
    const router = useRouter();
    const { battleId } = useLocalSearchParams();
    const [battle, setBattle] = useState<Battle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [voted, setVoted] = useState(false);

    const video1Ref = useRef(null);
    const video2Ref = useRef(null);

    useEffect(() => {
        if (battleId) {
            fetchBattle();
        }
    }, [battleId]);

    const fetchBattle = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/api/battles/${battleId}`, {
                withCredentials: true
            });
            setBattle(response.data);
        } catch (error) {
            console.error('Error fetching battle:', error);
            setError('Failed to load the battle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (votedFor: string, votedAgainst: string) => {
        if (!battleId) return;

        try {
            // We need to get userId from somewhere, either battle object or session
            const userId = battle?._id || '';
            await castVote(battleId.toString(), userId, votedFor, votedAgainst);
            setVoted(true);
            // Maybe show some success animation
            setTimeout(() => {
                router.push('/home');
            }, 1500);
        } catch (error) {
            console.error('Error casting vote:', error);
            setError('Failed to cast your vote. Please try again.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ActivityIndicator size="large" color="#00d4ff" />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
                        <ThemedText style={styles.buttonText}>Back to Home</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!battle) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ThemedText style={styles.errorText}>Battle not found</ThemedText>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
                        <ThemedText style={styles.buttonText}>Back to Home</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <ThemedText style={styles.title}>Battle: #{battle.tag}</ThemedText>

                    <View style={styles.videosContainer}>
                        {/* First Video */}
                        <View style={styles.videoWrapper}>
                            <Video
                                ref={video1Ref}
                                source={{ uri: battle.video1.url }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={false}
                                //resizeMode="contain"
                                shouldPlay={false}
                                useNativeControls
                                style={styles.video}
                            />
                            <ThemedText style={styles.videoTitle}>{battle.video1.title}</ThemedText>

                            {!voted && (
                                <TouchableOpacity
                                    style={styles.voteButton}
                                    onPress={() => handleVote(battle.video1._id, battle.video2._id)}
                                >
                                    <ThemedText style={styles.voteButtonText}>Vote</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Second Video */}
                        <View style={styles.videoWrapper}>
                            <Video
                                ref={video2Ref}
                                source={{ uri: battle.video2.url }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={false}
                                //resizeMode={"contain"}
                                shouldPlay={false}
                                useNativeControls
                                style={styles.video}
                            />
                            <ThemedText style={styles.videoTitle}>{battle.video2.title}</ThemedText>

                            {!voted && (
                                <TouchableOpacity
                                    style={styles.voteButton}
                                    onPress={() => handleVote(battle.video2._id, battle.video1._id)}
                                >
                                    <ThemedText style={styles.voteButtonText}>Vote</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {voted && (
                        <View style={styles.votedContainer}>
                            <ThemedText style={styles.votedText}>Thanks for your vote!</ThemedText>
                            <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/home')}>
                                <ThemedText style={styles.nextButtonText}>Next Battle</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity style={styles.backButton} onPress={() => router.push('/home')}>
                        <ThemedText style={styles.backButtonText}>Back to Home</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

const { width } = Dimensions.get('window');
const videoWidth = width / 2 - 30; // Half screen minus padding

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    videosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    videoWrapper: {
        width: videoWidth,
        alignItems: 'center',
    },
    video: {
        width: videoWidth,
        height: videoWidth * 1.5,
        borderRadius: 8,
        backgroundColor: '#1F1F1F',
    },
    videoTitle: {
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 16,
    },
    voteButton: {
        backgroundColor: '#00d4ff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    voteButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    votedContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    votedText: {
        fontSize: 18,
        marginBottom: 10,
    },
    nextButton: {
        backgroundColor: '#00d4ff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#888',
        fontSize: 16,
    },
    errorText: {
        color: '#ff4d4d',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#00d4ff',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
});