import { useState } from "react";
import { Text, View, ScrollView, TextInput, Switch } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";

const COUPON_CODE = "FRANTIGER2026";
const MAX_COUPON_NIGHTS = 3;
const COUPON_DISCOUNT = 0.2;
const GST_RATE = 0.05;

export default function Planner() {
  const router = useRouter();
  const { city, nights, budget } = useLocalSearchParams();

  const totalNights = Number(nights);
  const userBudget = Number(budget);

  const [booking, setBooking] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [couponValid, setCouponValid] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [limitErrorIndex, setLimitErrorIndex] = useState(null);
  const [bill, setBill] = useState(null);

  const hotels = [
    { id: 1, name: "Grand Sapphire Suites", price: 850 },
    { id: 2, name: "Emerald Bay Residency", price: 950 },
    { id: 3, name: "Silver Palm Retreat", price: 1100 },
    { id: 4, name: "Royal Horizon Hotel", price: 1200 },
    { id: 5, name: "Sunset Orchid Lodge", price: 1000 },
    { id: 6, name: "Crystal Crown Inn", price: 1050 },
    { id: 7, name: "Azure Garden Hotel", price: 900 },
    { id: 8, name: "Golden Harbor Stay", price: 1150 },
    { id: 9, name: "Velvet Leaf Resort", price: 980 },
    { id: 10, name: "Moonlight Plaza Hotel", price: 1020 },
  ];

  function generatePlan() {
    let plan = [];
    let lastHotel = null;

    for (let i = 1; i <= totalNights; i++) {
      const available = hotels.filter((h) => h.id !== lastHotel);
      const cheapest = available.reduce((a, b) => (b.price < a.price ? b : a));

      plan.push({ night: i, hotelId: cheapest.id, coupon: false });
      lastHotel = cheapest.id;
    }

    setBooking(plan);
    recalc(plan);
  }

  function verifyCoupon() {
    if (couponInput === COUPON_CODE) {
      setCouponValid(true);
      setCouponMessage("Coupon verified. You can apply it to up to 3 nights.");
    } else {
      setCouponValid(false);
      setCouponMessage("Invalid coupon code.");
    }
    recalc(booking);
  }

  function updateHotel(i, id) {
    const updated = booking.map((b, idx) =>
      idx === i ? { ...b, hotelId: Number(id) } : b,
    );
    setBooking(updated);
    recalc(updated);
  }

  function toggleCoupon(i) {
    const used = booking.filter((b) => b.coupon).length;

    if (!booking[i].coupon && used >= MAX_COUPON_NIGHTS) {
      setLimitErrorIndex(i);
      setTimeout(() => setLimitErrorIndex(null), 2000);
      return;
    }

    const updated = booking.map((b, idx) =>
      idx === i ? { ...b, coupon: !b.coupon } : b,
    );

    setBooking(updated);
    recalc(updated);
  }

  function recalc(plan) {
    let subtotal = 0;

    plan.forEach((b) => {
      const hotel = hotels.find((h) => h.id === b.hotelId);
      let price = hotel.price;
      if (couponValid && b.coupon) price *= 1 - COUPON_DISCOUNT;
      subtotal += price;
    });

    const gst = subtotal > 999 ? subtotal * GST_RATE : 0;
    const total = subtotal + gst;

    setBill({
      subtotal: Math.round(subtotal),
      gst: Math.round(gst),
      total: Math.round(total),
      withinBudget: total <= userBudget,
    });
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#d0d3e1",
        padding: 20,
        alignItems: "center",
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
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
          Hotels in {city}
        </Text>

        {hotels.map((h) => (
          <Text key={h.id}>
            {h.name} — ₹{h.price}
          </Text>
        ))}

        <Text
          onPress={generatePlan}
          style={{
            marginTop: 15,
            fontWeight: "bold",
            padding: 12,
            backgroundColor: "#4fe8ab",
            textAlign: "center",
            borderRadius: 6,
          }}
        >
          Generate Plan
        </Text>

        {booking.length > 0 && (
          <>
            <Text
              onPress={() => router.replace("/")}
              style={{
                marginTop: 10,
                textAlign: "center",
                color: "red",
              }}
            >
              Reset
            </Text>

            <Text style={{ marginTop: 15, fontWeight: "bold" }}>
              Coupon Code
            </Text>

            <TextInput
              value={couponInput}
              onChangeText={setCouponInput}
              placeholder="Enter coupon"
              style={{
                borderWidth: 1,
                padding: 8,
                marginTop: 6,
              }}
            />

            <Text
              onPress={verifyCoupon}
              style={{
                marginTop: 8,
                backgroundColor: "#333",
                color: "#fff",
                padding: 10,
                textAlign: "center",
                borderRadius: 6,
              }}
            >
              Verify Coupon
            </Text>

            {couponMessage !== "" && (
              <View
                style={{
                  marginTop: 8,
                  backgroundColor: couponValid ? "#d4f8d4" : "#ffd6d6",
                  padding: 8,
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    color: couponValid ? "green" : "red",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {couponMessage}
                </Text>
              </View>
            )}

            <Text style={{ marginTop: 15, fontWeight: "bold" }}>
              Booking Plan
            </Text>

            {booking.map((b, i) => {
              const hotel = hotels.find((h) => h.id === b.hotelId);
              let price = hotel.price;
              if (couponValid && b.coupon) price *= 1 - COUPON_DISCOUNT;

              return (
                <View
                  key={i}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 10,
                    borderRadius: 6,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>Night {b.night}</Text>

                  <Text style={{ marginVertical: 6, fontSize: 15 }}>
                    Hotel:{" "}
                    <Text style={{ fontWeight: "600" }}>{hotel.name}</Text>
                  </Text>

                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 6,
                      overflow: "hidden",
                      marginBottom: 6,
                    }}
                  ></View>
                  <Picker
                    selectedValue={b.hotelId}
                    onValueChange={(v) => updateHotel(i, v)}
                  >
                    {hotels.map((h) => (
                      <Picker.Item key={h.id} label={h.name} value={h.id} />
                    ))}
                  </Picker>

                  {couponValid && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text>Apply Coupon</Text>
                      <Switch
                        value={b.coupon}
                        onValueChange={() => toggleCoupon(i)}
                      />
                    </View>
                  )}

                  {limitErrorIndex === i && (
                    <Text style={{ color: "red", marginTop: 4 }}>
                      Coupon can be applied to only 3 nights
                    </Text>
                  )}

                  <Text style={{ marginTop: 5 }}>
                    Price: ₹{Math.round(price)}
                  </Text>
                </View>
              );
            })}

            {bill && (
              <View
                style={{
                  marginTop: 15,
                  paddingTop: 10,
                  borderTopWidth: 1,
                }}
              >
                <Text>Subtotal: ₹{bill.subtotal}</Text>
                <Text>GST: ₹{bill.gst}</Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: bill.withinBudget ? "green" : "red",
                  }}
                >
                  Final: ₹{bill.total}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
