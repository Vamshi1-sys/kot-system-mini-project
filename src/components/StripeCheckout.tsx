import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51T84PgLibBxuKVqCYOxctIw5fjxj74u1v6TsWtvz2o7RJsfHwedQm4EPNIdJgq0I6Ts7X03LWWzZB72zPTJRcO7200AURMkFgE');

type CheckoutFormProps = {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
};

function CheckoutForm({ amount, onPaymentSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    // 1. Create PaymentIntent on backend
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const { clientSecret, demo } = await res.json();

    if (demo || !clientSecret || clientSecret.startsWith('demo_client_secret_')) {
      onPaymentSuccess(`demo_payment_${Date.now()}`);
      setLoading(false);
      return;
    }

    if (!stripe || !elements) {
      setError('Payment form is not ready yet.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card details are not ready yet.');
      setLoading(false);
      return;
    }

    // 2. Confirm card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });
    if (result.error) {
      setError(result.error.message || 'Payment failed');
    } else if (result.paymentIntent.status === 'succeeded') {
      onPaymentSuccess(result.paymentIntent.id);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {error && <div className="mt-3 text-sm font-bold text-red-500">{error}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Pay'}
      </button>
    </form>
  );
}

export default function StripeCheckout({ amount, onPaymentSuccess }: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm amount={amount} onPaymentSuccess={onPaymentSuccess} />
    </Elements>
  );
}
