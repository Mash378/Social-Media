import { TabBar } from "@/components/TabBar";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="battles"
        options={{
          title: "Battles",
        }}
      />
    </Tabs>
  );
}
