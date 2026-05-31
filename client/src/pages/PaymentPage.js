import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiShield } from 'react-icons/fi';

export default function PaymentPage() {
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const esewaData = searchParams.get('data');
    const apptId = searchParams.get('appointmentId');

    if (window.location.pathname.includes('failure') && apptId) {
      toast.error('Payment was cancelled. Please try again.');
      navigate(`/payment/${apptId}`);
      return;
    }

    if (esewaData && apptId) {
      api.post('/payments/verify-esewa', { data: esewaData, appointmentId: apptId })
        .then(() => {
          toast.success('Payment successful! ✨');
          navigate('/dashboard');
        })
        .catch(() => {
          toast.error('Payment verification failed');
          navigate(`/payment/${apptId}`);
        });
      return;
    }

    if (appointmentId) {
      api.get(`/appointments/${appointmentId}`)
        .then(r => setAppointment(r.data.appointment))
        .finally(() => setPageLoading(false));
    } else {
      setPageLoading(false);
    }
  }, []);

  const handleEsewaPayment = async () => {
    setLoading(true);

    try {
      const { data } = await api.post('/payments/initiate', { appointmentId });

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.gatewayUrl;

      Object.entries(data.formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start eSewa');
      setLoading(false);
    }
  };

  const handleTestConfirm = async () => {
    setLoading(true);

    try {
      await api.post('/payments/free-confirm', { appointmentId });
      toast.success('Appointment confirmed! (Test Mode) ✨');
      navigate('/dashboard');
    } catch {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="spinner" />;

  if (!appointment) {
    return (
      <div className="page container">
        <p>Appointment not found.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>
          Make Payment
        </h1>

        {/* Summary */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>
            Booking Summary
          </h3>

          {[
            ['Astrologer', appointment.astrologer?.user?.name],
            ['Date', appointment.date],
            ['Time', appointment.startTime],
            ['Type', appointment.type?.toUpperCase()],
            ['Duration', `${appointment.duration} Minutes`],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
                fontSize: 14,
                borderBottom: '1px solid var(--border)',
                paddingBottom: 8
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8
            }}
          >
            <strong style={{ fontSize: 16 }}>Total</strong>

            <strong
              style={{
                fontSize: 22,
                color: 'var(--primary)'
              }}
            >
              Rs. {appointment.amount}
            </strong>
          </div>
        </div>

        {/* eSewa button */}
        <div
          className="card"
          style={{ marginBottom: 16, textAlign: 'center' }}
        >
          <div
            style={{
              background: '#60BB46',
              borderRadius: 10,
              padding: '8px 20px',
              display: 'inline-block',
              marginBottom: 12
            }}
          >
            <span
              style={{
                color: '#fff',
                fontWeight: 900,
                fontSize: 22
              }}
            >
              eSewa
            </span>
          </div>

          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              marginBottom: 14
            }}
          >
            Nepal's No. 1 Digital Wallet
          </p>

          <button
            onClick={handleEsewaPayment}
            disabled={loading}
            style={{
              width: '100%',
              padding: 14,
              fontSize: 16,
              fontWeight: 700,
              background: '#60BB46',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer'
            }}
          >
            {loading
              ? 'Opening...'
              : `Pay Rs. ${appointment.amount} via eSewa`}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: 12,
              marginTop: 10
            }}
          >
            <FiShield /> Secured by eSewa
          </div>
        </div>

        {/* Test credentials */}
        <div
          className="card"
          style={{
            marginBottom: 16,
            background: '#fffbeb',
            border: '1px solid #f59e0b'
          }}
        >
          <p
            style={{
              fontWeight: 700,
              fontSize: 13,
              marginBottom: 8,
              color: '#92400e'
            }}
          >
            🧪 Use these credentials for testing:
          </p>

          {[
            ['eSewa ID', '9806800001'],
            ['Password', 'Nepal@123'],
            ['OTP', '123456']
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex',
                gap: 12,
                fontSize: 13,
                marginBottom: 4
              }}
            >
              <span style={{ color: '#92400e', minWidth: 90 }}>
                {k}:
              </span>

              <strong style={{ fontFamily: 'monospace' }}>
                {v}
              </strong>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '16px 0'
          }}
        >
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'var(--border)'
            }}
          />

          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)'
            }}
          >
            OR (for testing)
          </span>

          <div
            style={{
              flex: 1,
              height: 1,
              background: 'var(--border)'
            }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={handleTestConfirm}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: 12
          }}
        >
          ⚡ Test Mode — Confirm Without Payment
        </button>

        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: 6
          }}
        >
          Development testing only
        </p>
      </div>
    </div>
  );
}