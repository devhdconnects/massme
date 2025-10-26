// src/app/pay/[id]/pay-client.tsx
"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  // Petit filet de sécurité en dev
  console.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est manquante.");
}
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function InnerPayForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!stripe || !elements) return;

    setSubmitting(true);

    const submitResult = await elements.submit();
    if (submitResult.error) {
      setErr(submitResult.error.message || "Erreur de validation.");
      setSubmitting(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success/${orderId}`,
      },
    });

    setSubmitting(false);

    if (error) {
      setErr(error.message || "Paiement refusé.");
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      router.push(`/checkout/success/${orderId}?paid=1`);
    } else {
      router.push(`/checkout/success/${orderId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded p-4">
      <PaymentElement />
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button
        disabled={!stripe || !elements || submitting}
        className="border rounded px-4 py-2 hover:shadow disabled:opacity-60"
      >
        {submitting ? "Traitement..." : "Payer maintenant"}
      </button>
    </form>
  );
}

export default function PayClient({ orderId }: { orderId: string }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (e: any) {
        setError(e.message || "Impossible de créer le PaymentIntent");
      }
    })();
  }, [orderId]);

  const options = useMemo(() => ({ clientSecret: clientSecret || undefined }), [clientSecret]);

  if (!stripePromise) {
    return <div className="text-sm text-red-600">Clé publique Stripe absente (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!clientSecret) {
    return <div className="text-sm opacity-70">Chargement du paiement…</div>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <InnerPayForm orderId={orderId} />
    </Elements>
  );
}
