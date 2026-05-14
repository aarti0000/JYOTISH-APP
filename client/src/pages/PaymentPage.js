import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiShield, FiCreditCard } from 'react-icons/fi';

export default function PaymentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/appointments/${appointmentId}`).then(r => setAppointment(r.data.appointment));
  }, [appointmentId]);

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePay = async () => {
    setLoading(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) return toast.error('Failed to load payment gateway');

      const { data } = await api.post('/payments/create-order', { appointmentId });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'JyotishApp',
        description: `Consultation — ${appointment?.type}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            });
            toast.success('Payment successful! Appointment confirmed ✨');
            navigate('/dashboard');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: appointment?.user?.name,
          email: appointment?.user?.email,
        },
        theme: { color: '#7c3aed' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return <div className="spinner" />;

  const astrologer = appointment.astrologer;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Complete Payment</h1>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Booking Summary</h3>
          {[
            ['Astrologer', astrologer?.user?.name],
            ['Date', appointment.date],
            ['Time', appointment.startTime],
            ['Type', appointment.type?.toUpperCase()],
            ['Duration', `${appointment.duration} minutes`],
            ['Amount', `₹${appointment.amount}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
          <div style={{ borderTop: '2px solid var(--primary-light)', paddingTop: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total</strong>
              <strong style={{ fontSize: 20, color: 'var(--primary)' }}>₹{appointment.amount}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
          <FiShield /> Secured by Razorpay · 256-bit encryption
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16 }}
          onClick={handlePay} disabled={loading}>
          <FiCreditCard /> {loading ? 'Opening payment...' : `Pay ₹${appointment.amount}`}
        </button>
      </div>
    </div>
  );
}
