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
      const res = await fetch(`https://ll-2.onrender.com/api/materials/${material._id}/reviews`, {
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

  return (
    <div className="material-card">
      <div className="material-icon" style={{ color: material.type === 'pdf' ? '#ef4444' : '#3b82f6' }}>
        {material.type === 'pdf' ? '📄' : '📝'}
      </div>
      <h4>{material.title}</h4>
      <p>{material.subject}</p>
      <p>{material.size}</p>
      <div className="material-actions">
        <button
          onClick={() => {
            if (material.publicId) {
              // Download via backend endpoint for real document
              window.open(`https://ll-2.onrender.com/api/materials/download/${material.publicId}`, '_blank');
            } else if (material.fileUrl) {
              // Fallback to direct link
              window.open(material.fileUrl, '_blank');
            } else {
              openModal({ type: 'info', title: 'No File', message: 'No file available for download.' });
            }
          }}
        >Download</button>
        <button onClick={() => onShare(material)}>Share</button>
      </div>
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={closeModal} actions={[]} />
      <div className="material-comments">
        <h5>Comments</h5>
        {comments.length === 0 ? <p>No comments yet.</p> : (
          <ul>
            {comments.map((r, idx) => (
              <li key={idx}><b>{r.user?.firstName || r.user || 'Student'}:</b> {r.comment}</li>
            ))}
          </ul>
        )}
        <form onSubmit={handleCommentSubmit} style={{ marginTop: 8 }}>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
            style={{ width: '80%' }}
          />
          <button type="submit" disabled={loading || !comment.trim()} style={{ marginLeft: 4 }}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaterialCard;