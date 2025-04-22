import { fetchProfile, UserProfile } from "@/api";
import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProfile(await fetchProfile());
      } catch (e: any) {
        if (e.response?.status === 401) router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sections = profile
    ? [
        {
          title: `${profile.username}ʼs Videos`,
          data: profile.videos,
          type: "video",
        },
        { title: "Your Recent Votes", data: profile.votes, type: "vote" },
      ]
    : [];

  const renderItem = ({ item, section }: any) => {
    if (section.type === "video") {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setSelectedUrl(item.url)}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.tags}>
            tags: {item.tags.join(", ") || "none"}
          </Text>
          <Text style={styles.date}>
            {new Date(item.uploadedAt).toLocaleString()}
          </Text>
        </TouchableOpacity>
      );
    }

    const raw = Number(item.endsInMs);
    const left = isNaN(raw) ? 0 : Math.max(0, raw);
    const hrs = Math.floor(left / 3600000);
    const min = Math.floor(left / 60000) % 60;

    return (
      <View style={styles.voteCard}>
        <Text style={styles.voteText}>
          Voted in a <Text style={styles.colored}>#{item.tag}</Text> battle
          for&nbsp;
          <Text style={styles.colored}>{item.videoTitle}</Text>
        </Text>
        <Text style={styles.voteTime}>
          {left > 0 ? `${hrs}h ${min}m left` : "Finished"}
        </Text>
      </View>
    );
  };

  if (loading)
    return <ActivityIndicator style={{ marginTop: 40 }} color="#00d4ff" />;

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SectionList
        sections={sections}
        keyExtractor={(i, idx) => (i._id ? i._id : idx.toString())}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
      />

      <Modal visible={!!selectedUrl} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalBg}
          onPress={() => setSelectedUrl(null)}
        >
          {selectedUrl && (
            <Video
              source={{ uri: selectedUrl }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              style={styles.modalVideo}
              useNativeControls
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  sectionTitle: { fontSize: 22, color: "#fff", margin: 12, marginTop: 20 },
  card: { padding: 12, borderBottomWidth: 1, borderColor: "#333" },
  title: { color: "#fff", fontSize: 16 },
  tags: { color: "#00d4ff", marginTop: 4 },
  date: { color: "#888", fontSize: 12, marginTop: 2 },
  voteCard: { padding: 12, borderBottomWidth: 1, borderColor: "#333" },
  voteText: { color: "#fff" },
  voteTime: { color: "#888", fontSize: 12, marginTop: 2 },
  colored: { color: "#00d4ff" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
  },
  modalVideo: { width: "100%", aspectRatio: 16 / 9 },
});
