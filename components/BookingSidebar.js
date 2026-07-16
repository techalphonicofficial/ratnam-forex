'use client';

import { useState } from 'react';

export default function BookingSidebar({ tour }) {
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(2);

  // Mock pricing based on image
  const originalPrice = tour?.price || 26999;
  const discountPrice = Math.round(originalPrice * 0.8); // 20% off

  return (
    <div className="booking-sidebar">
      <style>{`
        .booking-sidebar {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          border: 1px solid #f1f5f9;
        }
        .discount-badge {
          background: #fee2e2;
          color: #ef4444;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 12px;
        }
        .price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 24px;
        }
        .original-price {
          color: #94a3b8;
          text-decoration: line-through;
          font-size: 16px;
          font-weight: 500;
        }
        .current-price {
          color: #0f172a;
          font-size: 32px;
          font-weight: 800;
        }
        .price-suffix {
          color: #64748b;
          font-size: 14px;
        }
        .input-group {
          margin-bottom: 16px;
          position: relative;
        }
        .sidebar-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          color: #334155;
          outline: none;
          transition: border-color 0.2s;
          background: #fff;
          appearance: none;
        }
        .sidebar-input:focus {
          border-color: var(--color-primary);
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }
        .btn-book {
          width: 100%;
          background: var(--color-secondary);
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .btn-book:hover { opacity: 0.9; transform: translateY(-2px); }
        .btn-enquiry {
          width: 100%;
          background: #fff;
          color: var(--color-secondary);
          border: 1px solid var(--color-secondary);
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .btn-enquiry:hover { background: #fff7ed; }
        .contact-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        .btn-contact {
          padding: 12px;
          border-radius: 8px;
          border: none;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity 0.2s;
        }
        .btn-contact:hover { opacity: 0.9; }
        .btn-whatsapp { background: #22c55e; }
        .btn-call { background: #3b82f6; }
        .trust-badges {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
        .trust-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
          flex: 1;
        }
        .trust-icon {
          width: 32px;
          height: 32px;
          background: #f8fafc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
        }
        .trust-text {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          line-height: 1.2;
        }
      `}</style>

      <div className="discount-badge">20% OFF</div>
      
      <div className="price-row">
        <span className="original-price">₹{originalPrice.toLocaleString()}</span>
        <span className="current-price">₹{discountPrice.toLocaleString()}</span>
        <span className="price-suffix">per person</span>
      </div>

      <div className="input-group">
        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <input 
          type="date" 
          className="sidebar-input" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Select Travel Date"
        />
      </div>

      <div className="input-group">
        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <select 
          className="sidebar-input"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        >
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="3">3 Guests</option>
          <option value="4">4 Guests</option>
          <option value="5">5+ Guests</option>
        </select>
      </div>

      <button className="btn-book">
        Book Now 
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </button>

      <button className="btn-enquiry">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        Send Enquiry
      </button>

      <div className="contact-row">
        <button className="btn-contact btn-whatsapp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          WhatsApp
        </button>
        <button className="btn-contact btn-call">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          Call Now
        </button>
      </div>

      <div className="trust-badges">
        <div className="trust-badge">
          <div className="trust-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <span className="trust-text">Best Price<br/>Guarantee</span>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <span className="trust-text">24x7<br/>Support</span>
        </div>
        <div className="trust-badge">
          <div className="trust-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <span className="trust-text">Safe & Secure<br/>Booking</span>
        </div>
      </div>
    </div>
  );
}
