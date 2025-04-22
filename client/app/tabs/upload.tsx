import { ThemedText } from "@/components/ThemedText";
import axios from "axios";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Upload() {
  const router = useRouter();
  const { audioId } = useLocalSearchParams();
  const [error, setError] = useState("");
  const [video, setVideo] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [tagsString, setTagsString] = useState("");

  const pickVideo = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "You need to allow access to the gallery."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!video) {
      setError("Please select a video first");
      return;
    }

    if (!title || !tagsString) {
      setError("All fields are required");
      return;
    }
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("tags", JSON.stringify(tags));

    /* ----------  convert uri → real File if we’re on web ---------- */
    if (Platform.OS === "web") {
      const res = await fetch(video); // 👈 fetch the blob
      const blob = await res.blob();
      const file = new File([blob], "video.mp4", { type: blob.type });
      formData.append("video", file); // ✅ real file part
    } else {
      // Native iOS / Android can keep using the RN-style object
      formData.append("video", {
        uri: video,
        name: "video.mp4",
        type: "video/mp4",
      } as any);
    }
    try {
      const response = await axios.post(
        "http://localhost:3001/api/videos/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert("Success", "Video uploaded successfully!");
      setVideo(null);
      setTitle("");
      setTagsString("");
      router.replace("/home");
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "Upload failed";
      setError(message);
    }
  };
  return (
    <>
      <StatusBar
        style="light"
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText style={styles.backText}>← Back</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Upload Video</ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.container}>
            <ThemedText style={styles.title}>Upload a New Video</ThemedText>
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
              <Text style={styles.buttonText}>Select Video</Text>
            </TouchableOpacity>
            {video && (
              <Video
                source={{ uri: video }}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                shouldPlay
              />
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <Text style={styles.buttonText}>Upload</Text>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.guidelinesTitle}>
            Upload Guidelines:
          </ThemedText>
          <View style={styles.guidelinesList}>
            <ThemedText style={styles.guidelineItem}>
              • Videos must be under 60 seconds
            </ThemedText>
            <ThemedText style={styles.guidelineItem}>
              • Add relevant tags to make your video discoverable
            </ThemedText>
            <ThemedText style={styles.guidelineItem}>
              • Content must follow community guidelines
            </ThemedText>
            <ThemedText style={styles.guidelineItem}>
              • Higher quality videos perform better in battles
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: "#888",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  video: {
    width: 150,
    height: 150,
    marginTop: 20,
  },
  container: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#1F1F1F",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: "#FFF",
  },
  uploadButton: {
    backgroundColor: "#00d4ff",
    borderRadius: 8,
    marginTop: 15,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    gap: 10,
  },
  errorText: {
    color: "#ff4d4d",
    marginBottom: 15,
    textAlign: "center",
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
  },
  guidelinesList: {
    backgroundColor: "#1F1F1F",
    borderRadius: 10,
    padding: 15,
  },
  guidelineItem: {
    fontSize: 14,
    color: "#CCC",
    marginBottom: 8,
  },
});
