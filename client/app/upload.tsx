// app/upload.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import VideoUploader from '@/components/VideoUploader';

export default function UploadScreen() {
    const router = useRouter();
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleUploadComplete = (videoData: any) => {
        setUploadSuccess(true);

    };

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ThemedText style={styles.backText}>← Back</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.headerTitle}>Upload Video</ThemedText>
                        <View style={{ width: 40 }} />
                    </View>

                    <VideoUploader onUploadComplete={handleUploadComplete} />

                    {uploadSuccess && (
                        <View style={styles.successContainer}>
                            <ThemedText style={styles.successText}>Video uploaded successfully!</ThemedText>
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setUploadSuccess(false);
                                        // Reset the uploader state
                                    }}
                                >
                                    <ThemedText style={styles.actionButtonText}>Upload Another</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.primaryButton]}
                                    onPress={() => router.push('/my-videos')}
                                >
                                    <ThemedText style={styles.primaryButtonText}>View My Videos</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <ThemedText style={styles.guidelinesTitle}>Upload Guidelines:</ThemedText>
                    <View style={styles.guidelinesList}>
                        <ThemedText style={styles.guidelineItem}>• Videos must be under 60 seconds</ThemedText>
                        <ThemedText style={styles.guidelineItem}>• Add relevant tags to make your video discoverable</ThemedText>
                        <ThemedText style={styles.guidelineItem}>• Content must follow community guidelines</ThemedText>
                        <ThemedText style={styles.guidelineItem}>• Higher quality videos perform better in battles</ThemedText>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollContent: {
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
    successContainer: {
        backgroundColor: '#1F3333',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        marginVertical: 20,
    },
    successText: {
        fontSize: 18,
        color: '#00d4ff',
        marginBottom: 15,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    actionButton: {
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#FFF',
    },
    primaryButton: {
        backgroundColor: '#00d4ff',
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    guidelinesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 10,
    },
    guidelinesList: {
        backgroundColor: '#1F1F1F',
        borderRadius: 10,
        padding: 15,
    },
    guidelineItem: {
        fontSize: 14,
        color: '#CCC',
        marginBottom: 8,
    },
});