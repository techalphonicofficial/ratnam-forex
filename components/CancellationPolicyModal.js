'use client';

import React, { useEffect } from 'react';

export default function CancellationPolicyModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="cpm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cpm-modal-title"
      onClick={onClose}
    >
      <div
        className="cpm-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cpm-header">
          <div className="cpm-header-left">
            <div className="cpm-shield-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 id="cpm-modal-title" className="cpm-title">CANCELLATION POLICY</h2>
              <div className="cpm-meta-pill">Last Updated: 19 October 2026</div>
            </div>
          </div>
          <button
            type="button"
            className="cpm-close-btn"
            onClick={onClose}
            aria-label="Close cancellation policy modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="cpm-body">
          {/* Intro Notice */}
          <div className="cpm-intro-callout">
            <p>
              At <strong>Tour &amp; Holiday</strong>, we understand that travel plans can change unexpectedly. Our Cancellation Policy explains the terms and conditions applicable when a customer cancels a booking, requests a date change, or seeks a refund for any tour package booked through our website.
            </p>
            <p style={{ marginTop: '10px', marginBottom: 0 }}>
              This policy applies to all tour packages offered by Tour &amp; Holiday, including domestic tours, international holidays, honeymoon packages, family tours, group trips, and customized travel packages, unless specific terms are communicated in writing at the time of booking.
            </p>
          </div>

          {/* Section 1 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">1. Cancellation by the Customer</h3>
            <p>
              If you wish to cancel your booking, you must submit your cancellation request to Tour &amp; Holiday through our official communication channels. Cancellation requests will be considered effective once they have been received and acknowledged by our team.
            </p>
            <p>
              The applicable cancellation charges will depend on the time remaining before the scheduled departure date, the amount already paid, and the cancellation terms of the hotels, airlines, transport providers, activity operators, or other suppliers included in your package.
            </p>
            <p>
              Unless different terms have been expressly communicated and accepted at the time of booking, the following standard cancellation schedule may apply:
            </p>

            {/* Standard Cancellation Schedule Table / Cards */}
            <div className="cpm-schedule-grid">
              <div className="cpm-sched-card">
                <div className="cpm-sched-time">30 days or more before departure</div>
                <div className="cpm-sched-charge cpm-sched-charge--low">Up to 10%</div>
                <div className="cpm-sched-note">of total package cost charged</div>
              </div>
              <div className="cpm-sched-card">
                <div className="cpm-sched-time">15–29 days before departure</div>
                <div className="cpm-sched-charge cpm-sched-charge--med">Up to 25%</div>
                <div className="cpm-sched-note">of total package cost charged</div>
              </div>
              <div className="cpm-sched-card">
                <div className="cpm-sched-time">7–14 days before departure</div>
                <div className="cpm-sched-charge cpm-sched-charge--high">Up to 50%</div>
                <div className="cpm-sched-note">of total package cost charged</div>
              </div>
              <div className="cpm-sched-card">
                <div className="cpm-sched-time">Less than 7 days before departure</div>
                <div className="cpm-sched-charge cpm-sched-charge--critical">Up to 75%</div>
                <div className="cpm-sched-note">of total package cost charged</div>
              </div>
              <div className="cpm-sched-card cpm-sched-card--full">
                <div className="cpm-sched-time">On departure date, after departure, or no-show</div>
                <div className="cpm-sched-charge cpm-sched-charge--critical">Up to 100%</div>
                <div className="cpm-sched-note">No refund applicable</div>
              </div>
            </div>

            <p className="cpm-disclaimer-text">
              These are proposed standard terms. Actual cancellation charges may differ where supplier conditions, non-refundable bookings, special offers, peak-season arrangements, visa services, or other package-specific terms apply. Any applicable variation should be disclosed to the customer before booking confirmation.
            </p>
          </div>

          {/* Section 2 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">2. Refund Policy</h3>
            <p>
              Once a cancellation request has been reviewed and the applicable charges have been calculated, any eligible refund will be processed using the original payment method wherever possible.
            </p>
            <div className="cpm-highlight-box">
              <div className="cpm-highlight-icon">⏱</div>
              <div>
                <strong>Processing Timeline:</strong> Refunds are generally initiated within <strong>7–14 business days</strong> after cancellation approval. The time taken for the refunded amount to appear in your account may vary depending on your bank, card issuer, payment gateway, or other payment service provider.
              </div>
            </div>
            <p style={{ marginTop: '10px' }}>
              Any non-refundable booking fees, payment processing charges where applicable, supplier penalties, or other charges disclosed in the booking terms may be deducted from the refundable amount.
            </p>
          </div>

          {/* Section 3 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">3. Non-Refundable Bookings</h3>
            <p>
              Certain travel services may be non-refundable, including but not limited to:
            </p>
            <ul className="cpm-bullet-list">
              <li>Promotional or special-discount packages sold under non-refundable conditions.</li>
              <li>Flight tickets, train tickets, hotel reservations, permits, or activities subject to non-refundable supplier rules.</li>
              <li>Bookings made during peak seasons or special events with specific cancellation conditions.</li>
              <li>Services already used, delivered, or confirmed under non-refundable terms.</li>
            </ul>
            <p>
              Any non-refundable conditions applicable to your booking should be communicated before payment or booking confirmation.
            </p>
          </div>

          {/* Section 4 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">4. Cancellation by Tour &amp; Holiday</h3>
            <p>
              Tour &amp; Holiday reserves the right to cancel or modify a tour due to insufficient participation, operational difficulties, safety concerns, natural disasters, government restrictions, or other circumstances beyond its reasonable control.
            </p>
            <p>
              If Tour &amp; Holiday cancels a package and cannot offer a suitable alternative, eligible refunds for amounts paid for the affected services will be handled in accordance with the booking terms and applicable law. Any deductions or exclusions must be supported by the relevant booking conditions and applicable supplier terms.
            </p>
            <p>
              Where possible, we may offer an alternative departure date, a replacement package, or a credit toward a future booking. Any alternative arrangement will be subject to mutual agreement.
            </p>
          </div>

          {/* Section 5 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">5. Changes to Booking Dates or Travel Plans</h3>
            <p>
              Customers who wish to change their travel dates, destination, accommodation, passenger details, or other package arrangements should contact Tour &amp; Holiday as early as possible.
            </p>
            <p>
              Changes are subject to availability and approval by the relevant travel suppliers. Additional costs, fare differences, amendment fees, or supplier penalties may apply. If a requested change cannot be accommodated, the original cancellation terms may apply.
            </p>
          </div>

          {/* Section 6 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">6. Force Majeure and Unforeseen Circumstances</h3>
            <p>
              Tour &amp; Holiday is not responsible for disruptions caused by circumstances beyond its reasonable control, including extreme weather, natural disasters, epidemics, pandemics, political unrest, strikes, government restrictions, or transportation disruptions.
            </p>
            <p>
              In such cases, we will make reasonable efforts to assist customers with available alternatives, rescheduling, or refund requests, subject to the terms of the booking, the policies of the relevant service providers, and applicable law.
            </p>
          </div>

          {/* Section 7 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">7. Travel Insurance</h3>
            <div className="cpm-highlight-box cpm-highlight-box--amber">
              <div className="cpm-highlight-icon">🛡️</div>
              <div>
                <strong>Strong Recommendation:</strong> We strongly recommend that customers purchase suitable travel insurance covering trip cancellation, medical emergencies, travel delays, baggage loss, and other unforeseen events.
              </div>
            </div>
            <p style={{ marginTop: '10px' }}>
              Travel insurance may help protect you against certain losses that are not refundable under the applicable booking conditions. Coverage depends on your insurer and policy terms.
            </p>
          </div>

          {/* Section 8 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">8. How to Request a Cancellation</h3>
            <p>
              To cancel a booking, please contact our support team using the contact details provided in your booking confirmation or on our official website.
            </p>
            <p>
              Please include your <strong>booking reference number</strong>, the <strong>lead traveller&apos;s name</strong>, your <strong>scheduled departure date</strong>, and the <strong>reason for cancellation</strong>. Our team will review your request and communicate the applicable cancellation charges and refund eligibility.
            </p>
          </div>

          {/* Section 9 */}
          <div className="cpm-section">
            <h3 className="cpm-sec-title">9. Policy Updates</h3>
            <p>
              Tour &amp; Holiday may update this Cancellation Policy from time to time. Any changes will be published on this page with an updated revision date. The terms applicable to an existing booking will be determined by the conditions communicated and accepted at the time of booking, subject to applicable law.
            </p>
          </div>

          {/* Section 10 */}
          <div className="cpm-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <h3 className="cpm-sec-title">10. Contact Us</h3>
            <p>
              For cancellation requests, refund-related queries, or assistance with your booking, please contact Tour &amp; Holiday through the official contact details listed on our website or in your booking confirmation.
            </p>
            <p className="cpm-acknowledgment-box">
              ✓ By confirming a booking, customers acknowledge that they have had the opportunity to review the applicable cancellation and refund terms.
            </p>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="cpm-footer">
          <div className="cpm-footer-hint">
            Questions? Contact 24x7 support through your booking confirmation.
          </div>
          <button
            type="button"
            className="cpm-done-btn"
            onClick={onClose}
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .cpm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 16px;
          animation: cpmFadeIn 0.25s ease-out;
        }

        .cpm-container {
          background: #ffffff;
          width: min(94vw, 820px);
          max-height: 88vh;
          border-radius: 20px;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: cpmSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cpm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
        }

        .cpm-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .cpm-shield-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: color-mix(in srgb, var(--color-primary, #AA8453) 14%, transparent);
          color: var(--color-primary, #AA8453);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cpm-title {
          font-family: "Italiana", sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: 0.5px;
        }

        .cpm-meta-pill {
          font-size: 11.5px;
          font-weight: 600;
          color: #64748b;
          margin-top: 2px;
        }

        .cpm-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .cpm-close-btn:hover {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
          transform: rotate(90deg);
        }

        .cpm-body {
          padding: 24px 28px;
          overflow-y: auto;
          color: #334155;
          font-size: 14px;
          line-height: 1.7;
          scroll-behavior: smooth;
        }

        .cpm-body::-webkit-scrollbar {
          width: 6px;
        }
        .cpm-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .cpm-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .cpm-intro-callout {
          background: #f8fafc;
          border-left: 4px solid var(--color-primary, #AA8453);
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
          font-size: 14.5px;
          color: #1e293b;
        }

        .cpm-section {
          padding-bottom: 22px;
          margin-bottom: 22px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cpm-section p {
          margin: 0 0 12px;
        }

        .cpm-sec-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cpm-schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          margin: 16px 0;
        }

        .cpm-sched-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 14px;
          text-align: center;
          transition: transform 0.15s ease;
        }
        .cpm-sched-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
        }
        .cpm-sched-card--full {
          grid-column: 1 / -1;
          background: #fff5f5;
          border-color: #fed7d7;
        }

        .cpm-sched-time {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .cpm-sched-charge {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .cpm-sched-charge--low { color: #16a34a; }
        .cpm-sched-charge--med { color: #d97706; }
        .cpm-sched-charge--high { color: #ea580c; }
        .cpm-sched-charge--critical { color: #dc2626; }

        .cpm-sched-note {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }

        .cpm-disclaimer-text {
          font-size: 12.5px;
          color: #64748b;
          background: #fafafa;
          padding: 10px 14px;
          border-radius: 8px;
          margin-top: 14px !important;
          border-left: 3px solid #cbd5e1;
        }

        .cpm-highlight-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 12px 16px;
          color: #1e3a8a;
          font-size: 13.5px;
          margin: 12px 0;
        }
        .cpm-highlight-box--amber {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        .cpm-highlight-icon {
          font-size: 18px;
          line-height: 1;
        }

        .cpm-bullet-list {
          margin: 10px 0 16px 20px;
          padding: 0;
        }
        .cpm-bullet-list li {
          margin-bottom: 6px;
          color: #334155;
        }

        .cpm-acknowledgment-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 10px 14px;
          color: #166534;
          font-weight: 600;
          font-size: 13px;
          margin-top: 12px !important;
        }

        .cpm-footer {
          padding: 14px 24px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-shrink: 0;
        }

        .cpm-footer-hint {
          font-size: 12px;
          color: #64748b;
        }

        .cpm-done-btn {
          background: var(--color-primary, #AA8453);
          color: #ffffff;
          border: none;
          padding: 9px 24px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary, #AA8453) 30%, transparent);
        }
        .cpm-done-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        @keyframes cpmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cpmSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .cpm-header {
            padding: 14px 16px;
          }
          .cpm-title {
            font-size: 18px;
          }
          .cpm-shield-icon {
            width: 36px;
            height: 36px;
          }
          .cpm-body {
            padding: 18px 16px;
            font-size: 13.5px;
          }
          .cpm-schedule-grid {
            grid-template-columns: 1fr;
          }
          .cpm-footer {
            flex-direction: column-reverse;
            padding: 12px 16px;
            text-align: center;
          }
          .cpm-done-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
