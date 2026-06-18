import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

const QUICK_PHRASES = ["HELP", "HOSPITAL", "DANGER", "CALL FAMILY", "NEED WATER"];

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#05070f", padding: 16 }}>
      <Text style={{ color: "#9de9ff", fontSize: 24, fontWeight: "700" }}>SignConnect Mobile</Text>
      <Text style={{ color: "#d6e8ff", marginTop: 8 }}>
        Offline emergency communication companion mode
      </Text>
      <View style={{ marginTop: 16, gap: 8 }}>
        {QUICK_PHRASES.map((item) => (
          <TouchableOpacity key={item} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#345" }}>
            <Text style={{ color: "#e8f6ff", fontSize: 18 }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
