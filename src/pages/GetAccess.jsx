import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { registerCollege } from '../api';
import './Login.css';

const GetAccess = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    collegeName: '',
    adminName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await registerCollege(formData);
      setSuccess(res.data.message || 'Your 1-day free trial has been activated successfully.');
      setTimeout(() => {
        navigate('/login?role=Admin');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register college. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="unified-login-container">
      {/* Left visual section */}
      <div className="login-visual-section">
        <div className="visual-overlay"></div>
        <div className="visual-content">
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'white', padding: '12px', borderRadius: '12px' }}>
              <Zap size={32} color="var(--primary)" />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              ERP<span style={{ color: '#93c5fd' }}>SaaS</span>
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
            Modernize Your<br />Campus Today
          </h1>
          <p className="brand-description" style={{ fontSize: '1.1rem', maxWidth: '400px' }}>
            Join hundreds of institutions using our AI-powered ERP platform to streamline academics, fees, transport, and administration.
          </p>
          
          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
              <ShieldCheck size={20} color="#68d391" />
              <span style={{ fontWeight: 500 }}>Bank-grade Data Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
              <ShieldCheck size={20} color="#68d391" />
              <span style={{ fontWeight: 500 }}>Role-Based Access Control</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
              <ShieldCheck size={20} color="#68d391" />
              <span style={{ fontWeight: 500 }}>99.9% Platform Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form section */}
      <div className="login-form-section" style={{ overflowY: 'auto' }}>
        <div className="login-card-container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <div className="login-card-header" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Get Started Free</h2>
            <p style={{ color: 'var(--text-muted)' }}>Register your institution and activate your 1-day free trial instantly.</p>
          </div>

          {success && (
            <div style={{ padding: '16px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
              <ShieldCheck size={24} />
              {success}
            </div>
          )}

          {error && (
            <div className="login-error-msg" style={{ marginBottom: '24px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="unified-form">
            <div className="input-group">
              <label>College / Institution Name</label>
              <div className="input-wrapper">
                <Building2 size={18} className="form-icon" />
                <input
                  type="text"
                  name="collegeName"
                  placeholder="e.g. Global Tech Institute"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Administrator Name</label>
              <div className="input-wrapper">
                <User size={18} className="form-icon" />
                <input
                  type="text"
                  name="adminName"
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Admin Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="form-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <div className="input-wrapper">
                <Phone size={18} className="form-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Admin Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="form-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Creating Account...' : <><Zap size={18} /> Start Free Trial <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-muted)' }}>
            Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Login Here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetAccess;
