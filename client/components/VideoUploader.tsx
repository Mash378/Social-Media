// components/VideoUploader.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
import { ThemedText } from './ThemedText';

// Define proper types
interface VideoUploaderProps {
    onUploadComplete: (data: any) => void;
}

export default function VideoUploader({ onUploadComplete }: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [tagsString, setTagsString] = useState('');

    const pickVideo = async () => {
        // Request permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("You need to grant permission to access your videos!");
            return;
        }

        // Pick a video
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            // Upload the video
            await uploadVideo(result.assets[0].uri);
        }
    };

    const uploadVideo = async (uri: string) => {
        setUploading(true);
        setProgress(0);

        try {
            // Parse tags from the tagsString
            const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

            // Create form data for the upload
            const formData = new FormData();
            // @ts-ignore - TypeScript doesn't fully understand FormData with React Native
            formData.append('video', {
                uri,
                name: 'video.mp4',
                type: 'video/mp4',
            });
            formData.append('title', title);
            formData.append('tags', JSON.stringify(tags));

            // Upload using axios
            const response = await axios.post('http://localhost:3001/api/videos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: progressEvent => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percentCompleted);
                    }
                },
                withCredentials: true
            });

            // Handle successful upload
            if (response.status === 201) {
                alert('Video uploaded successfully!');
                if (onUploadComplete) onUploadComplete(response.data);
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Failed to upload video. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.title}>Upload a New Video</ThemedText>

            {/* Video title input */}
            <TextInput
                style={styles.input}
                placeholder="Video Title"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
            />

            {/* Tags input - simplified for now */}
            <TextInput
                style={styles.input}
                placeholder="Tags (comma separated)"
                placeholderTextColor="#888"
                value={tagsString}
                onChangeText={setTagsString}
            />

            <TouchableOpacity style={styles.uploadButton} onPress={pickVideo}>
                <ThemedText style={styles.buttonText}>Select Video</ThemedText>
            </TouchableOpacity>

            {uploading && (
                <View style={styles.progressContainer}>
                    <ActivityIndicator size="small" color="#00d4ff" />
                    <ThemedText>{progress}%</ThemedText>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#1F1F1F',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        color: '#FFF',
    },
    uploadButton: {
        backgroundColor: '#00d4ff',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        gap: 10,
    },
});