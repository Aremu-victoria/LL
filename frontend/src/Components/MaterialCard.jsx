import React, { useState } from 'react';
import Modal from './Modal';

const MaterialCard = ({ material, user, onDownload, onShare }) => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(material.reviews || []);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const openModal = (payload) => setModal({ isOpen: true, title: '', message: '', type: 'info', ...payload });
  const closeModal = () => setModal(m => ({ ...m, isOpen: false }));

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://ll-3.onrender.com/api/materials/${material._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.name, comment })
      });
      if (res.ok) {
        const updatedMaterial = await res.json();
        setComments(updatedMaterial.reviews || []);
        setComment('');
      } else {
        openModal({ type: 'error', title: 'Failed', message: 'Failed to post comment.' });
      }
    } catch (err) {
      openModal({ type: 'error', title: 'Failed', message: 'Failed to post comment.' });
    }
    setLoading(false);
  };

  // Helpers
  const ext = (material.type || '').toLowerCase();
  const isPdf = ext === 'pdf';
  const icon = isPdf ? '📄' : ['doc','docx'].includes(ext) ? '📝' : ['xls','xlsx'].includes(ext) ? '📊' : ['ppt','pptx'].includes(ext) ? '📊' : '📄';
  const color = isPdf ? '#ef4444' : ['doc','docx'].includes(ext) ? '#3b82f6' : ['xls','xlsx'].includes(ext) ? '#10b981' : ['ppt','pptx'].includes(ext) ? '#f59e0b' : '#6366f1';
  const created = material.createdAt ? new Date(material.createdAt).toLocaleDateString() : '';
  const downloads = material.downloads || 0;

  return (
    <div
      className="material-card"
      style={{
        background: '#ffffff',
        border: '1px solid #eef2f7',
        borderRadius: 16,
        padding: 20,
        width:'18rem',
        boxShadow: '0 6px 18px rgba(17,24,39,0.06)',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        display: 'grid',
        gap: 12
      }}
      onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 24px rgba(17,24,39,0.10)'; }}
      onMouseLeave={(e)=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 18px rgba(17,24,39,0.06)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          aria-label={ext || 'file'}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${color}1A`,
            color,
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            flex: '0 0 auto'
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: '#111827', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={material.title}>
            {material.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {material.subject && (
              <span style={{ fontSize: 12, background: '#f3f4f6', color: '#111827', padding: '3px 8px', borderRadius: 999 }}>{material.subject}</span>
            )}
            {material.classLevel && (
              <span style={{ fontSize: 12, background: '#eef2ff', color: '#4338ca', padding: '3px 8px', borderRadius: 999 }}>{material.classLevel}</span>
            )}
            {material.size && (
              <span style={{ fontSize: 12, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 999 }}>{material.size}</span>
            )}
            {created && (
              <span style={{ fontSize: 12, color: '#6b7280' }}>Uploaded {created}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#6b7280', fontSize: 13 }}>
        <span title="Downloads">⬇️ {downloads}</span>
        {Array.isArray(comments) && comments.length > 0 && (
          <span title="Comments">💬 {comments.length}</span>
        )}
      </div>

      {/* Actions */}
      <div className="material-actions" style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => {
            if (typeof onDownload === 'function') {
              onDownload(material);
              return;
            }
            if (material.publicId) {
              window.open(`https://ll-3.onrender.com/api/materials/download/${material.publicId}`, '_blank');
            } else if (material.fileUrl) {
              window.open(material.fileUrl, '_blank');
            } else {
              openModal({ type: 'info', title: 'No File', message: 'No file available for download.' });
            }
          }}
          style={{
            background: '#1A2A80', color: '#fff', border: 'none', padding: '8px 12px',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600
          }}
        >
          View / Download
        </button>
        <button
          onClick={() => onShare ? onShare(material) : navigator.clipboard.writeText(material.fileUrl || '').then(()=>openModal({type:'success', title:'Link Copied', message:'Material link copied to clipboard!'})).catch(()=>openModal({type:'error', title:'Copy Failed', message:'Failed to copy link.'}))}
          style={{
            background: '#ffffff', color: '#1A2A80', border: '1px solid #1A2A80', padding: '8px 12px',
            borderRadius: 8, cursor: 'pointer', fontWeight: 600
          }}
        >
          Share Link
        </button>
      </div>

      {/* Comments */}
      <div className="material-comments" style={{ marginTop: 4 }}>
        <h5 style={{ margin: '6px 0', color: '#111827' }}>Comments</h5>
        {comments.length === 0 ? <p style={{ color: '#6b7280', margin: 0 }}>No comments yet.</p> : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {comments.map((r, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                <b>{r.user?.firstName || r.user || 'Student'}:</b> {r.comment}
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleCommentSubmit} style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
            style={{ flex: 1, borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 10px' }}
          />
          <button type="submit" disabled={loading || !comment.trim()} style={{ background: '#111827', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>

      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={closeModal} actions={[]} />
    </div>
  );
};

export default MaterialCard;