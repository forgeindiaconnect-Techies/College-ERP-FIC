import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AdminSubscription = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      // Endpoint to fetch my subscription details (the college the admin belongs to)
      const res = await api.get('/admin/my-subscription');
      setSubscription(res.data.subscription);
      setPayments(res.data.payments);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleUpgradeRenew = () => {
    navigate('/upgrade-plan');
  };

  if (loading) {
    return <div className="p-6">Loading subscription details...</div>;
  }

  const daysRemaining = calculateDaysRemaining(subscription?.endDate);
  const isExpired = subscription?.status === 'Expired' || daysRemaining === 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;

  return (
    <div className="animate-fade-in" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-main)' }}>My Subscription</h1>
      
      {/* Grace Period Warning */}
      {isExpired && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={24} />
          <div>
            <h4 style={{ fontWeight: 700, margin: 0 }}>Subscription Expired</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>You have 2 days of grace period left to renew before access is restricted. New user creation is currently blocked.</p>
          </div>
        </div>
      )}

      {/* Expiring Soon Warning */}
      {!isExpired && isExpiringSoon && (
        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={24} />
          <div>
            <h4 style={{ fontWeight: 700, margin: 0 }}>Expiring Soon</h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Your {subscription?.planName || subscription?.plan} plan expires in {daysRemaining} days. Please renew to avoid service interruption.</p>
          </div>
        </div>
      )}

      {/* Subscription Card */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Current Plan Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Plan Name</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-color)' }}>{subscription?.planName || subscription?.plan || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Status</p>
                <p style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600, 
                  color: isExpired ? '#ef4444' : '#10b981'
                }}>
                  {isExpired ? 'Expired' : 'Active'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Expiry Date</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Days Remaining</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{daysRemaining} Days</p>
              </div>
            </div>
          </div>
          <div>
            <button 
              onClick={handleUpgradeRenew}
              style={{
                background: 'linear-gradient(135deg, var(--primary-color) 0%, #4338ca 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              <CreditCard size={18} />
              {subscription?.plan === 'Trial' || subscription?.planName === 'Trial' ? 'Upgrade Plan' : 'Renew Subscription'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Payment History</h2>
      <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Plan</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No payment history found.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}>{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{payment.planName}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>₹{payment.amount}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      background: payment.paymentStatus === 'Success' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                      color: payment.paymentStatus === 'Success' ? '#10b981' : '#f59e0b' 
                    }}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button title="Download Invoice" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '4px' }}>
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSubscription;
