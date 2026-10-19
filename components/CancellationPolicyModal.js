'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  getCancellationPolicy,
  transformCancellationHtml,
  FALLBACK_CANCELLATION_DATA,
} from '@/utils/cancellationPolicy';

export default function CancellationPolicyModal({ isOpen, onClose, policyData: incomingPolicyData }) {
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    if (!incomingPolicyData && !fetchedData) {
      getCancellationPolicy().then((data) => {
        if (mounted && data) setFetchedData(data);
      });
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      mounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, incomingPolicyData, fetchedData]);

  const activeData = incomingPolicyData || fetchedData || FALLBACK_CANCELLATION_DATA;

  const transformedHtml = useMemo(() => {
    return transformCancellationHtml(activeData.rawHtml || FALLBACK_CANCELLATION_DATA.rawHtml);
  }, [activeData.rawHtml]);

  if (!isOpen) return null;

  const title = activeData.title || 'Cancellation Policy';
  const updatedPill = activeData.updatedPill || 'Updated Oct 2026';
  const displayPill = /^(last\s+updated|updated)/i.test(updatedPill)
    ? updatedPill
    : `Last Updated: ${updatedPill}`;

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
              <h2 id="cpm-modal-title" className="cpm-title">{title.toUpperCase()}</h2>
              <div className="cpm-meta-pill">{displayPill}</div>
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

        {/* Scrollable Policy Body with Dynamic Content Arranged in Designed Format */}
        <div className="cpm-body">
          <div
            className="cpm-dynamic-content"
            dangerouslySetInnerHTML={{ __html: transformedHtml }}
          />
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
          width: min(94vw, 840px);
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

        :global(.cpm-intro-callout) {
          background: #f8fafc;
          border-left: 4px solid var(--color-primary, #AA8453);
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
          font-size: 14.5px;
          color: #1e293b;
        }
        :global(.cpm-intro-callout p) {
          margin: 0 0 10px;
        }
        :global(.cpm-intro-callout p:last-child) {
          margin-bottom: 0;
        }

        :global(.cpm-section) {
          padding-bottom: 22px;
          margin-bottom: 22px;
          border-bottom: 1px solid #f1f5f9;
        }
        :global(.cpm-section:last-child) {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        :global(.cpm-section p) {
          margin: 0 0 12px;
        }

        :global(.cpm-dynamic-content h3),
        :global(.cpm-sec-title) {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        :global(.cpm-schedule-grid) {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          margin: 16px 0;
        }

        :global(.cpm-sched-card) {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 14px;
          text-align: center;
          transition: transform 0.15s ease;
        }
        :global(.cpm-sched-card:hover) {
          transform: translateY(-2px);
          border-color: #cbd5e1;
        }
        :global(.cpm-sched-card--full) {
          grid-column: 1 / -1;
          background: #fff5f5;
          border-color: #fed7d7;
        }

        :global(.cpm-sched-time) {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        :global(.cpm-sched-charge) {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        :global(.cpm-sched-charge--low) { color: #16a34a; }
        :global(.cpm-sched-charge--med) { color: #d97706; }
        :global(.cpm-sched-charge--high) { color: #ea580c; }
        :global(.cpm-sched-charge--critical) { color: #dc2626; }

        :global(.cpm-sched-note) {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }

        :global(.cpm-disclaimer-text) {
          font-size: 12.5px;
          color: #64748b;
          background: #fafafa;
          padding: 10px 14px;
          border-radius: 8px;
          margin-top: 14px !important;
          border-left: 3px solid #cbd5e1;
        }

        :global(.cpm-highlight-box) {
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
        :global(.cpm-highlight-box--amber) {
          background: #fffbeb;
          border-color: #fde68a;
          color: #92400e;
        }
        :global(.cpm-highlight-icon) {
          font-size: 18px;
          line-height: 1;
        }

        :global(.cpm-dynamic-content ul) {
          margin: 10px 0 16px 20px;
          padding: 0;
        }
        :global(.cpm-dynamic-content li) {
          margin-bottom: 6px;
          color: #334155;
        }

        :global(.cpm-acknowledgment-box) {
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
          :global(.cpm-schedule-grid) {
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
