'use client';

import { useEffect, useState } from 'react';
import { getHomePage } from '@/utils/api';

const fallbackFaqs = [
  {
    question: 'What is included in a tour package?',
    answer: 'Most tour packages include accommodation, domestic transfers, sightseeing, daily breakfast, and 24/7 travel assistance. Depending on the itinerary, international flights, private transfers, and e-visa assistance can also be included.',
  },
  {
    question: 'Are flights included in tour packages?',
    answer: 'Some of our tour packages with flights from India bundle round-trip international flights into the price, while others are land-only. You can add or remove flights when customising your itinerary.',
  },
  {
    question: 'Which package is best for honeymoon couples?',
    answer: 'Couples typically prefer 5- to 7-day itineraries built around an overnight cruise, a riverside stay, candle-light dinners, and couples\' spa treatments. Check our Honeymoon section for curated options.',
  },
  {
    question: 'Can I combine multiple destinations in one trip?',
    answer: 'Yes. Many of our tour packages combine multiple destinations using short regional flight connections between countries, making it easy to explore more in a single trip.',
  },
  {
    question: 'How do I customize my travel package?',
    answer: 'Use our Customize flow to pick your destination, travel dates, number of travelers, and preferred hotel category. Our travel experts will craft a personalized itinerary and share a detailed quote within 24 hours.',
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Cancellation policies vary by package and hotel. Most packages offer free cancellation up to 30 days before departure. Detailed terms are shared in your booking confirmation email.',
  },
];

export default function FAQSection() {
  const [faqs, setFaqs] = useState(fallbackFaqs);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchFaqs = async () => {
      try {
        const page = await getHomePage();
        const faqSection = page?.details?.find(
          (d) => d.key === 'faq' || d.section === 'faq' || (d.title || '').toLowerCase().includes('faq')
        );
        const items = faqSection?.json_data?.faqs || faqSection?.json_data?.items || [];
        if (mounted && items.length > 0) {
          setFaqs(items.map(item => ({
            question: item.question || item.title || item.q || '',
            answer: item.answer || item.description || item.content || item.a || '',
          })));
        }
      } catch (err) {
        // Keep fallback
      }
    };

    fetchFaqs();
    return () => { mounted = false; };
  }, []);

  const toggle = (idx) => {
    setOpenIndex(prev => prev === idx ? null : idx);
  };

  return (
    <section className="faq-section">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <div className="faq-flex-container">

          {/* Left Side - Heading */}
          <div className="faq-heading-col">
            <h2 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              marginBottom: '16px',
              fontFamily: '"Italiana", sans-serif',
              lineHeight: 1.3,
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#777',
              margin: 0,
            }}>
              Got questions? We&apos;ve got answers! Find helpful info about bookings, packages, payments, and more—all in one place.
            </p>
          </div>

          {/* Right Side - FAQ List */}
          <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '0',
                  }}
                >
                  <button
                    onClick={() => toggle(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '20px 0',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#999',
                      flexShrink: 0,
                      width: '24px',
                    }}>
                      {idx + 1}.
                    </span>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      flex: 1,
                      lineHeight: 1.5,
                    }}>
                      {faq.question}
                    </span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#999"
                      strokeWidth="2"
                      style={{
                        flexShrink: 0,
                        marginTop: '2px',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div style={{
                    maxHeight: isOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <p style={{
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: '#666',
                      margin: '0 0 20px 36px',
                    }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <style jsx>{`
        .faq-section {
          padding: 60px 0 80px;
          background: transparent;
        }
        .faq-flex-container {
          display: flex;
          gap: 60px;
          flex-wrap: wrap;
          align-items: flex-start;
        }
        .faq-heading-col {
          flex: 0 0 300px;
          min-width: 250px;
          position: sticky;
          top: 100px;
        }
        @media (max-width: 768px) {
          .faq-section {
            padding: 32px 0 40px;
          }
          .faq-flex-container {
            gap: 16px;
          }
          .faq-heading-col {
            flex: 1 1 100%;
            position: static;
            margin-bottom: 0px;
          }
        }
      `}</style>
    </section>
  );
}
