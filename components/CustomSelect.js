'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <div
        className={className}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          minWidth: '150px',
          marginTop: '4px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          zIndex: 9999,
          maxHeight: '220px',
          overflowY: 'auto',
          border: '1px solid #eee'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              onMouseEnter={(e) => {
                if (String(opt.value) !== String(value)) {
                  e.currentTarget.style.background = '#FFF9FA';
                  e.currentTarget.style.color = '#D9466F';
                }
              }}
              onMouseLeave={(e) => {
                if (String(opt.value) !== String(value)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#444';
                }
              }}
              style={{
                padding: '10px 16px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: String(opt.value) === String(value) ? '#fff' : '#444',
                background: String(opt.value) === String(value) ? '#D9466F' : 'transparent',
                fontWeight: String(opt.value) === String(value) ? '600' : '400',
                whiteSpace: 'nowrap'
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
