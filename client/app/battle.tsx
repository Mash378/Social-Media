// client/app/battle.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
    Animated,
    PanResponder
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
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
    const [currentIndex, setCurrentIndex] = useState(0);

    // Video refs for controlling playback
    const video1Ref = useRef<Video>(null);
    const video2Ref = useRef<Video>(null);

    // Animation values
    const position = useRef(new Animated.Value(0)).current;

    // Calculate screen dimensions
    const { width, height } = Dimensions.get('window');

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

    // Set up pan responder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                position.setValue(gestureState.dx);
            },
            onPanResponderRelease: (_, gestureState) => {
                // If swipe distance is significant, change video
                if (Math.abs(gestureState.dx) > width * 0.25) {
                    const newIndex = gestureState.dx > 0 ? 0 : 1;

                    Animated.spring(position, {
                        toValue: gestureState.dx > 0 ? width : -width,
                        useNativeDriver: true,
                        tension: 40,
                        friction: 8
                    }).start(() => {
                        position.setValue(0);
                        setCurrentIndex(newIndex);
                    });
                } else {
                    // Return to original position if swipe not significant
                    Animated.spring(position, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    // Handle video playback based on current index
    useEffect(() => {
        const playCurrentVideo = () => {
            try {
                if (currentIndex === 0) {
                    if (video2Ref.current) {
                        video2Ref.current.pauseAsync();
                    }
                    if (video1Ref.current) {
                        video1Ref.current.playAsync();
                    }
                } else {
                    if (video1Ref.current) {
                        video1Ref.current.pauseAsync();
                    }
                    if (video2Ref.current) {
                        video2Ref.current.playAsync();
                    }
                }
            } catch (error) {
                console.log('Error controlling video playback:', error);
            }
        };

        if (battle) {
            playCurrentVideo();
        }

        // Cleanup function to pause videos when component unmounts
        return () => {
            if (video1Ref.current) {
                video1Ref.current.pauseAsync();
            }
            if (video2Ref.current) {
                video2Ref.current.pauseAsync();
            }
        };
    }, [currentIndex, battle]);

    const handleVote = async (votedFor: string, votedAgainst: string) => {
        if (!battleId || !battle) return;

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

    // Get current video data
    const currentVideo = currentIndex === 0 ? battle.video1 : battle.video2;
    const otherVideo = currentIndex === 0 ? battle.video2 : battle.video1;

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Battle Title */}
                    <View style={styles.headerContainer}>
                        <ThemedText style={styles.title}>Battle: #{battle.tag}</ThemedText>
                        <ThemedText style={styles.swipeHint}>
                            Swipe to switch videos
                        </ThemedText>
                    </View>

                    {/* Videos Container */}
                    <Animated.View
                        style={[
                            styles.fullScreenVideoContainer,
                            {
                                transform: [{ translateX: position }]
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {/* Video Player */}
                        <View style={styles.videoPlayer}>
                            {/* First Video - Hidden when not active */}
                            <View style={[
                                styles.videoWrapper,
                                { display: currentIndex === 0 ? 'flex' : 'none' }
                            ]}>
                                <Video
                                    ref={video1Ref}
                                    source={{ uri: battle.video1.url }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={currentIndex === 0}
                                    useNativeControls
                                    style={styles.fullScreenVideo}
                                />
                            </View>

                            {/* Second Video - Hidden when not active */}
                            <View style={[
                                styles.videoWrapper,
                                { display: currentIndex === 1 ? 'flex' : 'none' }
                            ]}>
                                <Video
                                    ref={video2Ref}
                                    source={{ uri: battle.video2.url }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={currentIndex === 1}
                                    useNativeControls
                                    style={styles.fullScreenVideo}
                                />
                            </View>
                        </View>

                        {/* Video Info Overlay */}
                        <View style={styles.videoInfoOverlay}>
                            <ThemedText style={styles.videoTitle}>{currentVideo.title}</ThemedText>

                            {/* Vote Button for Current Video */}
                            {!voted && (
                                <TouchableOpacity
                                    style={styles.voteButton}
                                    onPress={() => handleVote(currentVideo._id, otherVideo._id)}
                                >
                                    <ThemedText style={styles.voteButtonText}>
                                        Vote for {currentIndex === 0 ? 'Video 1' : 'Video 2'}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Animated.View>

                    {/* Thank You Screen */}
                    {voted && (
                        <View style={styles.votedContainer}>
                            <ThemedText style={styles.votedText}>Thanks for your vote!</ThemedText>
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={() => router.push('/home')}
                            >
                                <ThemedText style={styles.nextButtonText}>Next Battle</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Video Indicator */}
                    <View style={styles.indicatorContainer}>
                        <View
                            style={[
                                styles.indicator,
                                currentIndex === 0 ? styles.activeIndicator : {}
                            ]}
                        />
                        <View
                            style={[
                                styles.indicator,
                                currentIndex === 1 ? styles.activeIndicator : {}
                            ]}
                        />
                    </View>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push('/home')}
                    >
                        <ThemedText style={styles.backButtonText}>Back to Home</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        zIndex: 10,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    swipeHint: {
        fontSize: 14,
        color: '#FFF',
        opacity: 0.8,
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    fullScreenVideoContainer: {
        flex: 1,
        width: width,
        height: height,
    },
    videoPlayer: {
        width: width,
        height: height,
        backgroundColor: '#000',
    },
    videoWrapper: {
        width: '100%',
        height: '100%',
    },
    fullScreenVideo: {
        width: '100%',
        height: '100%',
    },
    videoInfoOverlay: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    videoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    voteButton: {
        backgroundColor: '#00d4ff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
    },
    voteButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    votedContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    votedText: {
        fontSize: 24,
        marginBottom: 20,
        color: '#FFF'
    },
    nextButton: {
        backgroundColor: '#00d4ff',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 10,
    },
    indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 5,
    },
    activeIndicator: {
        backgroundColor: '#00d4ff',
        width: 12,
        height: 12,
    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        zIndex: 10,
    },
    backButtonText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
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