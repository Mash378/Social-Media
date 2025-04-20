import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, PanResponder, SafeAreaView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {ResizeMode, Video as ExpoVideo} from 'expo-av';
import {ThemedText} from '@/components/ThemedText';

// Create a mock battle for testing
const mockBattle = {
    _id: 'mock-battle-1',
    tag: 'sample',
    video1: {
        _id: 'video1',
        title: 'Sample Video 1',
        url: 'https://drive.google.com/uc?export=download&id=1e4yQVIY7Y_GATDutrbt91fG7WHb7Nefm',
    },
    video2: {
        _id: 'video2',
        title: 'Sample Video 2',
        url: 'https://drive.google.com/uc?export=download&id=1e4yQVIY7Y_GATDutrbt91fG7WHb7Nefm',
    }
};

export default function SampleBattle() {
    const video1Ref = useRef<ExpoVideo>(null);
    const video2Ref = useRef<ExpoVideo>(null);
    // Video refs for controlling playback
    // const video1Ref = useRef(null);
    //const video2Ref = useRef(null);
    const [voted, setVoted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Animation values
    const position = useRef(new Animated.Value(0)).current;

    // Calculate screen dimensions
    const { width, height } = Dimensions.get('window');

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

                    // Pause the current video immediately
                    if (currentIndex === 0 && video1Ref.current) {
                        video1Ref.current.pauseAsync();
                    } else if (currentIndex === 1 && video2Ref.current) {
                        video2Ref.current.pauseAsync();
                    }

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
            // Set a small timeout to ensure refs are ready
            setTimeout(() => {
                try {
                    // Pause both videos first to avoid audio overlap
                    if (video1Ref.current) {
                        video1Ref.current.pauseAsync();
                    }
                    if (video2Ref.current) {
                        video2Ref.current.pauseAsync();
                    }

                    // Then play the current video after a brief delay
                    setTimeout(() => {
                        if (currentIndex === 0 && video1Ref.current) {
                            video1Ref.current.playAsync();
                        } else if (currentIndex === 1 && video2Ref.current) {
                            video2Ref.current.playAsync();
                        }
                    }, 30);
                } catch (error) {
                    console.log('Error controlling video playback:', error);
                }
            }, 100);
        };

        playCurrentVideo();

        // Cleanup function to pause videos when component unmounts
        return () => {
            if (video1Ref.current) {
                video1Ref.current.pauseAsync();
            }
            if (video2Ref.current) {
                video2Ref.current.pauseAsync();
            }
        };
    }, [currentIndex]);

    // Handle voting
    const handleVote = () => {
        const votedFor = currentIndex === 0 ? 'Video 1' : 'Video 2';
        setVoted(true);
        alert(`You voted for: ${votedFor}`);
    };

    // Reset battle
    const resetBattle = () => {
        setVoted(false);
        setCurrentIndex(0);
    };

    // Get current video data
    const currentVideo = currentIndex === 0 ? mockBattle.video1 : mockBattle.video2;

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Battle Title*/}
                    <View style={styles.headerContainer}>
                        <ThemedText style={styles.title}>Battle: #{mockBattle.tag}</ThemedText>
                        <ThemedText style={styles.swipeHint}>
                            Swipe to switch videos
                        </ThemedText>
                    </View>

                    {/*Video Container */}
                    <Animated.View
                        style={[
                            styles.fullScreenVideoContainer,
                            {
                                transform: [{ translateX: position }]
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {/*Video Player */}
                        <View style={styles.videoPlayer}>
                            {/*First Video - Hidden when not active */}
                            <View style={[
                                styles.videoWrapper,
                                { display: currentIndex === 0 ? 'flex' : 'none' }
                            ]}>
                                <ExpoVideo
                                    ref={video1Ref}
                                    source={{ uri: mockBattle.video1.url }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    style={styles.fullScreenVideo}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={currentIndex === 0}
                                    isLooping={true}
                                    useNativeControls
                                    progressUpdateIntervalMillis={50}
                                />
                            </View>

                            {/* Second Video - Hidden when not active */}
                            <View style={[
                                styles.videoWrapper,
                                { display: currentIndex === 1 ? 'flex' : 'none' }
                            ]}>
                                <ExpoVideo
                                    ref={video2Ref}
                                    source={{ uri: mockBattle.video1.url }}
                                    rate={1.0}
                                    volume={1.0}
                                    isMuted={false}
                                    style={styles.fullScreenVideo}
                                    resizeMode={ResizeMode.COVER}
                                    shouldPlay={currentIndex === 0}
                                    isLooping={true}
                                    useNativeControls
                                    progressUpdateIntervalMillis={50}
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
                                    onPress={handleVote}
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
                            <TouchableOpacity style={styles.nextButton} onPress={resetBattle}>
                                <ThemedText style={styles.nextButtonText}>New Battle</ThemedText>
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
    }
});