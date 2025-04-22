import { fetchBattles } from "@/api";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Battle {
  _id: string;
  video1: { title: string };
  video2: { title: string };
  tag: string;
  endsInMs?: number;
}
function formatTimeLeft(ms?: number): string {
  if (ms === undefined || ms <= 0) return "Finished";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

export default function BattlesTab() {
  const router = useRouter();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchBattles(); // GET /api/battles/active
        setBattles(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }: { item: Battle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/battle", params: { battleId: item._id } })
      }
    >
      <Text style={styles.tag}>#{item.tag}</Text>
      <Text style={styles.title}>
        {item.video1.title} vs {item.video2.title}
      </Text>
      <Text style={styles.time}>{formatTimeLeft(item.endsInMs)}</Text>
    </TouchableOpacity>
  );

  if (loading) return <Text style={styles.loading}>Loading battles…</Text>;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={battles}
        keyExtractor={(b) => b._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No active battles yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  loading: { color: "#fff", marginTop: 40, textAlign: "center" },
  empty: { color: "#888", marginTop: 40, textAlign: "center" },
  card: { padding: 14, borderBottomWidth: 1, borderColor: "#333" },
  tag: { color: "#00d4ff", marginBottom: 4 },
  title: { color: "#fff", fontSize: 16 },
  time: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
});
