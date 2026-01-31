import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  function calculateNights() {
    const diffMs = endDate.getTime() - startDate.getTime();
    const nights = diffMs / (1000 * 60 * 60 * 24);
    return nights > 0 ? Math.round(nights) : 0;
  }

  function handleBudgetChange(text) {
    setBudget(text.replace(/[^0-9]/g, ""));
  }

  function proceed() {
    const nights = calculateNights();
    const numericBudget = Number(budget);

    if (!city || nights <= 0 || numericBudget <= 0) return;

    router.push({
      pathname: "/planner",
      params: {
        city,
        nights,
        budget: numericBudget,
      },
    });
  }

  const nights = calculateNights();
  const canProceed = city && nights > 0 && Number(budget) > 0;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#d0d3e1",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          padding: 20,
          borderRadius: 10,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 15 }}>
          Plan Your Trip
        </Text>

        <Text>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          placeholder="Enter city"
          style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
        />

        <Text>Start Date</Text>
        <Pressable
          onPress={() => setShowStartPicker(true)}
          style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
        >
          <Text>{startDate.toDateString()}</Text>
        </Pressable>

        <Text>End Date</Text>
        <Pressable
          onPress={() => setShowEndPicker(true)}
          style={{ borderWidth: 1, padding: 10, marginBottom: 12 }}
        >
          <Text>{endDate.toDateString()}</Text>
        </Pressable>

        <Text>Budget (₹)</Text>
        <TextInput
          value={budget}
          onChangeText={handleBudgetChange}
          keyboardType="numeric"
          placeholder="Numbers only"
          style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
        />

        <Text style={{ marginBottom: 10 }}>
          Total Nights: <Text style={{ fontWeight: "bold" }}>{nights}</Text>
        </Text>

        <Pressable
          onPress={proceed}
          disabled={!canProceed}
          style={{
            backgroundColor: canProceed ? "#4fe8ab" : "#ccc",
            padding: 12,
            borderRadius: 6,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Continue</Text>
        </Pressable>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowStartPicker(false);
              if (d) setStartDate(d);
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowEndPicker(false);
              if (d) setEndDate(d);
            }}
          />
        )}
      </View>
    </View>
  );
}
