// src/app/pay/[id]/paypal-buttons.tsx
"use client";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PaypalButtons({ orderId }: { orderId: string }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

  return (
    <PayPalScriptProvider options={{ "client-id": clientId, currency: "EUR", intent: "capture" }}>
      <PayPalButtons
        createOrder={async () => {
          const r = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          if (!r.ok) throw new Error(await r.text());
          const { id } = await r.json();
          return id;
        }}
        onApprove={async (data) => {
          try {
            const r = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paypalOrderId: data.orderID, orderId }),
            });
            const json = await r.json();
            if (!r.ok) throw new Error(JSON.stringify(json));
            // ex: window.location.href = `/merci?order=${orderId}`;
          } catch (err) {
            console.error("capture-order failed:", err);
            alert("Échec de capture PayPal");
          }
        }}
      />
    </PayPalScriptProvider>
  );
}
