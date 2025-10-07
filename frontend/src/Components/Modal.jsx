import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, title, message, type = 'info', onClose, actions = [] }) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // next tick to allow transition
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else if (mounted) {
      // play exit
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  };
  const color = colors[type] || colors.info;

  const handleRequestClose = () => {
    setVisible(false);
    setTimeout(() => onClose && onClose(), 160);
  };

  return (
    <div
      onClick={handleRequestClose}
      style={{
        position: 'fixed', inset: 0,
        background: visible ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.0)',
        backdropFilter: visible ? 'blur(1px)' : 'blur(0px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        transition: 'background .16s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 14, width: '92%', maxWidth: 520,
          boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          transform: visible ? 'translateY(0px) scale(1)' : 'translateY(12px) scale(0.98)',
          opacity: visible ? 1 : 0,
          transition: 'transform .18s ease, opacity .18s ease'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          <h3 style={{ margin: 0, fontSize: 18 }}>{title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')}</h3>
        </div>
        <div style={{ padding: '16px 20px', color: '#374151' }}>
          {typeof message === 'string' ? <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message}</p> : message}
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid #eee', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {actions.map((a, idx) => (
            <button key={idx} onClick={a.onClick} style={{
              background: a.variant === 'primary' ? color : '#fff',
              color: a.variant === 'primary' ? '#fff' : '#1f2937',
              border: '1px solid ' + (a.variant === 'primary' ? color : '#e5e7eb'),
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
              transition: 'transform .12s ease'
            }} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Modal;
