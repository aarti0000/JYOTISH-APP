import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import SimplePeer from 'simple-peer';
import {
  FiSend, FiVideo, FiVideoOff, FiMic, FiMicOff,
  FiPhoneOff, FiMessageCircle, FiUser
} from 'react-icons/fi';
import './ConsultationRoom.css';
import './ConsultationRoom.css';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  // Video state
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callActive, setCallActive] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load consultation
  useEffect(() => {
    api.get(`/consultations/${id}`)
      .then(r => {
        setConsultation(r.data.consultation);
        setMessages(r.data.consultation.messages || []);
      })
      .catch(() => toast.error('Failed to load consultation'));
  }, [id]);

  // Join socket room
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('join_consultation', { consultationId: id });

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // WebRTC signalling
    socket.on('webrtc_offer', async ({ offer }) => {
      if (!peerRef.current) await initPeer(false);
      peerRef.current.signal(offer);
    });
    socket.on('webrtc_answer', ({ answer }) => {
      peerRef.current?.signal(answer);
    });
    socket.on('webrtc_ice_candidate', ({ candidate }) => {
      peerRef.current?.signal(candidate);
    });
    socket.on('call_ended', () => {
      stopCall();
      toast('The other person ended the call');
    });

    return () => {
      socket.off('receive_message');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('call_ended');
    };
  }, [socket, id]);

  // Auto scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { consultationId: id, content: input.trim() });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const initPeer = useCallback(async (initiator) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoOn, audio: micOn });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const peer = new SimplePeer({ initiator, stream, trickle: false });

      peer.on('signal', (data) => {
        if (initiator) {
          socket.emit('webrtc_offer', { consultationId: id, offer: data });
        } else {
          socket.emit('webrtc_answer', { consultationId: id, answer: data });
        }
      });

      peer.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });

      peer.on('error', (err) => console.error('Peer error:', err));

      peerRef.current = peer;
      setCallActive(true);
    } catch (err) {
      toast.error('Could not access camera/microphone');
    }
  }, [socket, id, videoOn, micOn]);

  const startCall = () => initPeer(true);

  const stopCall = () => {
    peerRef.current?.destroy();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallActive(false);
  };

  const endConsultation = async () => {
    socket.emit('call_ended', { consultationId: id });
    stopCall();
    try {
      await api.put(`/consultations/${id}/end`);
      toast.success('Consultation ended');
    } catch {}
    navigate('/dashboard');
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !videoOn; });
    setVideoOn(v => !v);
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(m => !m);
  };

  if (!consultation) return <div className="spinner" />;

  const isAstrologer = user?.role === 'astrologer';
  const otherParty = isAstrologer
    ? consultation.user
    : consultation.astrologer?.user;

  const showVideo = consultation.type === 'video';

  return (
    <div className="consultation-room">
      {/* Header */}
      <div className="room-header">
        <div className="room-header-left">
          <div className="avatar" style={{ width: 38, height: 38, fontSize: 14 }}>
            {otherParty?.avatar ? <img src={otherParty.avatar} alt="" /> : otherParty?.name?.[0]}
          </div>
          <div>
            <strong>{otherParty?.name}</strong>
            <div style={{ fontSize: 12, color: '#a78bfa' }}>
              {consultation.type?.toUpperCase()} Consultation
            </div>
          </div>
        </div>
        <div className="room-header-right">
          <button className="btn btn-danger" onClick={endConsultation}>
            <FiPhoneOff /> End Session
          </button>
        </div>
      </div>

      <div className="room-body">
        {/* Video area */}
        {showVideo && (
          <div className="video-area">
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
            <div className="video-controls">
              <button className={`ctrl-btn ${!micOn ? 'off' : ''}`} onClick={toggleMic}>
                {micOn ? <FiMic /> : <FiMicOff />}
              </button>
              <button className={`ctrl-btn ${!videoOn ? 'off' : ''}`} onClick={toggleVideo}>
                {videoOn ? <FiVideo /> : <FiVideoOff />}
              </button>
              {!callActive
                ? <button className="ctrl-btn start" onClick={startCall}><FiVideo /> Start Video</button>
                : <button className="ctrl-btn danger" onClick={stopCall}><FiVideoOff /> Stop</button>
              }
            </div>
          </div>
        )}

        {/* Chat / Notes tabs */}
        <div className="chat-panel">
          <div className="tab-bar" style={{ padding: '0 16px' }}>
            <button className={`tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <FiMessageCircle /> Chat
            </button>
            {isAstrologer && (
              <button className={`tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                Notes
              </button>
            )}
            <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
              <FiUser /> Details
            </button>
          </div>

          {activeTab === 'chat' && (
            <>
              <div className="messages-list">
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#a78bfa', marginTop: 40, fontSize: 13 }}>
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                  return (
                    <div key={i} className={`message ${isMe ? 'mine' : 'theirs'}`}>
                      <div className="message-bubble">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input">
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Type a message… (Enter to send)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ resize: 'none', flex: 1 }}
                />
                <button className="btn btn-primary" onClick={sendMessage} disabled={!input.trim()}>
                  <FiSend />
                </button>
              </div>
            </>
          )}

          {activeTab === 'notes' && isAstrologer && (
            <AstrologerNotes consultationId={id} />
          )}

          {activeTab === 'details' && (
            <div style={{ padding: '16px', fontSize: 14, overflowY: 'auto' }}>
              <h4 style={{ marginBottom: 12, color: '#e9d5ff' }}>User Birth Details</h4>
              {consultation.appointment?.userBirthDetails && Object.entries(consultation.appointment.userBirthDetails).map(([k, v]) => (
                v && (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <span style={{ color: '#a78bfa', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}: </span>
                    <strong style={{ color: '#fff' }}>{v}</strong>
                  </div>
                )
              ))}
              {consultation.appointment?.question && (
                <div style={{ marginTop: 16 }}>
                  <span style={{ color: '#a78bfa' }}>Question: </span>
                  <p style={{ color: '#e9d5ff', marginTop: 4 }}>{consultation.appointment.question}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AstrologerNotes({ consultationId }) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const saveNotes = async () => {
    try {
      await api.put(`/consultations/${consultationId}/notes`, { notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { toast.error('Failed to save notes'); }
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <p style={{ fontSize: 12, color: '#a78bfa' }}>Private notes (only visible to you)</p>
      <textarea
        style={{ flex: 1, background: '#1e1b4b', border: '1px solid #4c1d95', borderRadius: 8,
          color: '#e9d5ff', padding: 12, fontSize: 13, resize: 'none', outline: 'none' }}
        placeholder="Write your consultation notes here..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button className="btn btn-primary" onClick={saveNotes}>
        {saved ? '✅ Saved!' : 'Save Notes'}
      </button>
    </div>
  );
}
