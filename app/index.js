import { useState } from "react";
import { Text, View, TextInput } from "react-native";

const MAX_COUPON_NIGHTS = 3;
const COUPON_DISCOUNT = 0.2;
const GST_RATE = 0.05;

export default function Index() {
  const [totalNights, setTotalNights] = useState("1");
  const [budget, setBudget] = useState("1000");

  const [booking, setBooking] = useState([]);
  const [billBreakdown, setBillBreakdown] = useState(null);

  const hotels = [
    { id: 1, name: "Hotel 1", price: 850 },
    { id: 2, name: "Hotel 2", price: 950 },
    { id: 3, name: "Hotel 3", price: 1100 },
    { id: 4, name: "Hotel 4", price: 1200 },
    { id: 5, name: "Hotel 5", price: 1000 },
    { id: 6, name: "Hotel 6", price: 1050 },
    { id: 7, name: "Hotel 7", price: 900 },
    { id: 8, name: "Hotel 8", price: 1150 },
    { id: 9, name: "Hotel 9", price: 980 },
    { id: 10, name: "Hotel 10", price: 1020 },
  ];

  function generateBookingPlan() {
    const nights = Number(totalNights);
    const userBudget = Number(budget);

    if (
      Number.isNaN(nights) ||
      Number.isNaN(userBudget) ||
      nights <= 0 ||
      userBudget <= 0
    ) {
      setBooking([]);
      setBillBreakdown(null);
      return;
    }

    let plan = [];
    let lastHotelId = null;

    for (let night = 1; night <= nights; night++) {
      const availableHotels = hotels.filter(
        (hotel) => hotel.id !== lastHotelId,
      );
      const chosenHotel = availableHotels.reduce((cheapest, current) =>
        current.price < cheapest.price ? current : cheapest,
      );

      plan.push({
        night,
        hotel: chosenHotel,
        originalPrice: chosenHotel.price,
        discountedPrice: chosenHotel.price,
        couponApplied: false,
      });

      lastHotelId = chosenHotel.id;
    }
    applyPricing(plan, userBudget);
  }

  function applyPricing(plan, userBudget) {
    const byPriceDesc = [...plan].sort(
      (a, b) => b.originalPrice - a.originalPrice,
    );

    for (let i = 0; i < MAX_COUPON_NIGHTS && i < byPriceDesc.length; i++) {
      byPriceDesc[i].discountedPrice =
        byPriceDesc[i].originalPrice * (1 - COUPON_DISCOUNT);
      byPriceDesc[i].couponApplied = true;
    }

    const subtotal = byPriceDesc.reduce(
      (sum, item) => sum + item.discountedPrice,
      0,
    );

    const gst = subtotal > 999 ? subtotal * GST_RATE : 0;
    const finalTotal = subtotal + gst;

    const byNightAsc = [...byPriceDesc].sort((a, b) => a.night - b.night);

    setBooking(byNightAsc);
    setBillBreakdown({
      subtotal: Math.round(subtotal),
      gst: Math.round(gst),
      total: Math.round(finalTotal),
      withinBudget: finalTotal <= userBudget,
      couponCode: "FRANTIGER2026",
      couponAppliedCount: byPriceDesc.filter((i) => i.couponApplied).length,
    });
  }

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
          backgroundColor: "#ffffff",
          padding: 20,
          borderRadius: 8,
          width: "100%",
          maxWidth: 400,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 15,
          }}
        >
          Hotel Booking Planner
        </Text>

        <Text style={{ marginBottom: 4 }}>Total Nights</Text>
        <TextInput
          value={totalNights}
          onChangeText={setTotalNights}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            width: 120,
            marginBottom: 10,
            padding: 4,
            textAlign: "center",
          }}
        />

        <Text style={{ marginBottom: 4 }}>Budget (₹)</Text>
        <TextInput
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            width: 120,
            marginBottom: 15,
            padding: 4,
            textAlign: "center",
          }}
        />
        <Text
          onPress={generateBookingPlan}
          style={{
            fontWeight: "bold",
            marginBottom: 15,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 4,
            backgroundColor: "#4fe8ab",
          }}
        >
          Generate Suggested Booking Plan
        </Text>

        {booking.length > 0 && (
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Suggested Booking Plan
          </Text>
        )}

        {booking.map((item) => (
          <Text key={item.night} style={{ marginVertical: 2 }}>
            Night {item.night}: {item.hotel.name} | MRP ₹{item.originalPrice}
            {item.couponApplied
              ? ` → ₹${item.discountedPrice.toFixed(0)} (20% off)`
              : ""}
          </Text>
        ))}

        {billBreakdown && (
          <View style={{ marginTop: 15, alignItems: "center" }}>
            <Text style={{ fontWeight: "bold" }}>
              Coupon Applied: {billBreakdown.couponCode} (
              {billBreakdown.couponAppliedCount} nights)
            </Text>
            <Text>Subtotal: ₹{billBreakdown.subtotal}</Text>
            <Text>GST (5%): ₹{billBreakdown.gst}</Text>
            <Text
              style={{
                color: billBreakdown.withinBudget ? "green" : "red",
                fontWeight: "bold",
              }}
            >
              Final Bill: ₹{billBreakdown.total}{" "}
              {billBreakdown.withinBudget ? "(Within Budget)" : "(Over Budget)"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
