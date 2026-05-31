import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import {
  FiSend, FiVideo, FiVideoOff, FiMic, FiMicOff,
  FiPhoneOff, FiPhone, FiMessageCircle, FiUser
} from 'react-icons/fi';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [activeTab, setActiveTab]       = useState('chat');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const [callStatus, setCallStatus]     = useState('idle');
  const [micOn, setMicOn]               = useState(true);
  const [videoOn, setVideoOn]           = useState(true);
  const [incomingOffer, setIncomingOffer] = useState(null);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef        = useRef(null);
  const messagesEndRef = useRef(null);
  const consultationRef = useRef(null); // keep latest consultation in ref

  // Load consultation
  useEffect(() => {
    setLoading(true);
    api.get('/consultations/' + id)
      .then(r => {
        setConsultation(r.data.consultation);
        consultationRef.current = r.data.consultation;
        setMessages(r.data.consultation.messages || []);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load consultation'))
      .finally(() => setLoading(false));
  }, [id]);

  // Socket events
  useEffect(() => {
    if (!socket || !id) return;

    const join = () => socket.emit('join_consultation', { consultationId: id });
    if (socket.connected) join();
    else socket.on('connect', join);

    socket.on('receive_message', msg => setMessages(prev => [...prev, msg]));

    socket.on('user_joined', ({ userId }) => {
      if (userId !== user?._id) toast.success('Other person joined the room');
    });

    socket.on('webrtc_offer', ({ offer }) => {
      setIncomingOffer(offer);
      setCallStatus('incoming');
    });

    socket.on('webrtc_answer', ({ answer }) => {
      if (peerRef.current) peerRef.current.signal(answer);
    });

    socket.on('webrtc_ice_candidate', ({ candidate }) => {
      if (peerRef.current) peerRef.current.signal(candidate);
    });

    socket.on('call_ended', () => {
      cleanupCall();
      setCallStatus('ended');
      toast('The other person ended the call');
    });

    return () => {
      socket.off('connect', join);
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('call_ended');
    };
  }, [socket, id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── cleanupCall — defined before it is used anywhere ──────────────────────
  const cleanupCall = () => {
    if (peerRef.current) {
      try { peerRef.current.destroy(); } catch {}
      peerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    const audio = document.getElementById('remote-audio');
    if (audio) audio.srcObject = null;
    setCallStatus('idle');
    setIncomingOffer(null);
  };

  // ── Get user media with fallback ──────────────────────────────────────────
  const getStream = async (withVideo) => {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo });
    } catch (err) {
      if (withVideo && (err.name === 'NotReadableError' || err.name === 'NotFoundError')) {
        toast('Camera not available — using audio only');
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      throw err;
    }
  };

  // ── Create peer — used by both start and answer ───────────────────────────
  const createPeer = async (initiator, offerToSignal = null) => {
    try {
      const isVideo = consultationRef.current?.type === 'video';
      const stream  = await getStream(isVideo);
      localStreamRef.current = stream;

      if (isVideo && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Dynamic import to avoid "process is not defined" error
      const SimplePeerModule = await import('simple-peer');
      const SimplePeer = SimplePeerModule.default || SimplePeerModule;

      const peer = new SimplePeer({
        initiator,
        stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
              urls:       'turn:openrelay.metered.ca:80',
              username:   'openrelayproject',
              credential: 'openrelayproject',
            },
          ],
        },
      });

      peer.on('signal', data => {
        if (data.type === 'offer') {
          socket.emit('webrtc_offer',  { consultationId: id, offer: data });
        } else if (data.type === 'answer') {
          socket.emit('webrtc_answer', { consultationId: id, answer: data });
        } else if (data.candidate) {
          socket.emit('webrtc_ice_candidate', { consultationId: id, candidate: data });
        }
      });

      peer.on('stream', remoteStream => {
        setCallStatus('connected');
        toast.success('Call connected!');
        if (isVideo && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        } else {
          let audio = document.getElementById('remote-audio');
          if (!audio) {
            audio = document.createElement('audio');
            audio.id = 'remote-audio';
            audio.autoplay = true;
            document.body.appendChild(audio);
          }
          audio.srcObject = remoteStream;
          audio.play().catch(() => {});
        }
      });

      peer.on('connect', () => setCallStatus('connected'));

      peer.on('error', err => {
        console.error('Peer error:', err);
        toast.error('Call error: ' + err.message);
        cleanupCall();
      });

      peer.on('close', () => {
        setCallStatus('idle');
      });

      if (!initiator && offerToSignal) {
        peer.signal(offerToSignal);
      }

      peerRef.current = peer;
      setCallStatus(initiator ? 'calling' : 'connecting');

    } catch (err) {
      console.error('createPeer error:', err);
      if (err.name === 'NotAllowedError') {
        toast.error('Please allow microphone/camera access in browser settings');
      } else if (err.name === 'NotReadableError') {
        toast.error('Camera is being used by another app. Close it and try again.');
      } else if (err.name === 'NotFoundError') {
        toast.error('No microphone or camera found on this device');
      } else {
        toast.error('Could not start call: ' + err.message);
      }
    }
  };

  const startCall  = () => createPeer(true);
  const answerCall = () => {
    createPeer(false, incomingOffer);
    setIncomingOffer(null);
  };
  const rejectCall = () => {
    socket?.emit('call_ended', { consultationId: id });
    setIncomingOffer(null);
    setCallStatus('idle');
  };
  const endCall = () => {
    socket?.emit('call_ended', { consultationId: id });
    cleanupCall();
  };

  // ── End entire consultation session ───────────────────────────────────────
  const endConsultation = async () => {
    // 1. Tell the other person
    socket?.emit('call_ended', { consultationId: id });

    // 2. Stop any active call/stream
    cleanupCall();

    // 3. Mark consultation as ended in DB
    try {
      await api.put('/consultations/' + id + '/end');
    } catch (e) {
      console.error('End consultation error:', e);
    }

    toast.success('Consultation ended');

    // 4. Redirect based on role
    const apptId = consultationRef.current?.appointment?._id
      || consultationRef.current?.appointment;

    if (user?.role === 'user' && apptId) {
      navigate('/rate/' + apptId);
    } else {
      navigate('/astrologer/dashboard');
    }
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
    setMicOn(m => !m);
  };
  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !videoOn; });
    setVideoOn(v => !v);
  };

  const sendMessage = () => {
    if (!input.trim() || !socket?.connected) return;
    const tempMsg = { sender: user?._id, content: input.trim(), type:'text', createdAt: new Date() };
    setMessages(prev => [...prev, tempMsg]);
    socket.emit('send_message', { consultationId: id, content: input.trim() });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'calc(100vh - 64px)', flexDirection:'column', gap:16 }}>
      <div className="spinner" />
      <p style={{ color:'var(--text-muted)' }}>Loading consultation room...</p>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
      height:'calc(100vh - 64px)', flexDirection:'column', gap:16 }}>
      <FiPhoneOff size={48} style={{ color: 'var(--danger)' }} />
      <h2 style={{ color:'var(--danger)' }}>Could not load consultation</h2>
      <p style={{ color:'var(--text-muted)' }}>{error}</p>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );

  const isAstrologer = user?.role === 'astrologer';
  const otherParty   = isAstrologer ? consultation.user : consultation.astrologer?.user;
  const type         = consultation.type;
  const callActive   = ['calling','connecting','connected'].includes(callStatus);

  return (
    <div style={{ display:'flex', flexDirection:'column',
      height:'calc(100vh - 64px)', background:'#0f0c29', color:'#e9d5ff' }}>

      <audio id="remote-audio" autoPlay style={{ display:'none' }} />

      {/* ── Incoming call overlay ───────────────────────────────── */}
      {callStatus === 'incoming' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:1000, flexDirection:'column', gap:24 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ marginBottom:16, color: 'var(--primary)' }}>
              {type === 'video' ? <FiVideo size={56} /> : <FiPhone size={56} />}
            </div>
            <h2 style={{ color:'#fff', fontSize:24, marginBottom:8 }}>
              Incoming {type === 'video' ? 'Video' : 'Voice'} Call
            </h2>
            <p style={{ color:'#a78bfa', fontSize:16 }}>
              {otherParty?.name} is calling...
            </p>
          </div>
          <div style={{ display:'flex', gap:24 }}>
            <button onClick={answerCall} style={{ display:'flex', alignItems:'center',
              gap:10, padding:'18px 36px', borderRadius:50, border:'none',
              background:'#10b981', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:17 }}>
              {type === 'video' ? <FiVideo size={22}/> : <FiPhone size={22}/>} Accept
            </button>
            <button onClick={rejectCall} style={{ display:'flex', alignItems:'center',
              gap:10, padding:'18px 36px', borderRadius:50, border:'none',
              background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:17 }}>
              <FiPhoneOff size={22}/> Decline
            </button>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 20px', background:'var(--card)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="avatar" style={{ width:38, height:38, fontSize:14 }}>
            {otherParty?.avatar
              ? <img src={otherParty.avatar} alt="" />
              : otherParty?.name?.[0]}
          </div>
          <div>
            <strong style={{ color:'var(--text)' }}>{otherParty?.name}</strong>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>
              {type === 'video' ? 'Video' : type === 'call' ? 'Voice' : 'Chat'} Consultation
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%',
              background: socket?.connected ? '#10b981' : '#ef4444' }} />
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>
              {socket?.connected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          <button className="btn btn-danger" onClick={endConsultation}>
            <FiPhoneOff /> End Session
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── VIDEO PANEL ──────────────────────────────────────── */}
        {type === 'video' && (
          <div style={{ flex:1, position:'relative', background:'#0a0818',
            display:'flex', alignItems:'center', justifyContent:'center', minWidth:0 }}>

            <video ref={remoteVideoRef} autoPlay playsInline
              style={{ width:'100%', height:'100%', objectFit:'cover', background:'#111' }} />

            <video ref={localVideoRef} autoPlay playsInline muted
              style={{ position:'absolute', bottom:80, right:16, width:160, height:110,
                borderRadius:12, objectFit:'cover', border:'2px solid #7c3aed',
                background:'#312e81', display: callActive ? 'block' : 'none' }} />

            {/* Idle overlay */}
            {callStatus === 'idle' && (
              <div style={{ position:'absolute', inset:0, display:'flex',
                alignItems:'center', justifyContent:'center',
                flexDirection:'column', background:'rgba(0,0,0,0.7)', gap:20 }}>
                <FiVideo size={56} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))' }} />
                <p style={{ color:'#c4b5fd', fontSize:16, textAlign:'center' }}>
                  Click "Start Video Call" to call the other person
                </p>
                <button onClick={startCall} style={{ display:'flex', alignItems:'center',
                  gap:8, padding:'14px 32px', borderRadius:50, border:'none',
                  background:'#7c3aed', color:'#fff', cursor:'pointer',
                  fontWeight:700, fontSize:15 }}>
                  <FiVideo size={18}/> Start Video Call
                </button>
              </div>
            )}

            {/* Calling overlay */}
            {callStatus === 'calling' && (
              <div style={{ position:'absolute', inset:0, display:'flex',
                alignItems:'center', justifyContent:'center',
                flexDirection:'column', background:'rgba(0,0,0,0.65)', gap:16 }}>
                <FiPhone size={44} style={{ color: 'var(--secondary)', filter: 'drop-shadow(0 0 10px var(--secondary))' }} />
                <p style={{ color:'#fbbf24', fontSize:16 }}>
                  Calling {otherParty?.name}...
                </p>
                <p style={{ color:'#6b7280', fontSize:13 }}>
                  Waiting for them to accept
                </p>
                <button onClick={endCall} style={{ display:'flex', alignItems:'center',
                  gap:8, padding:'10px 24px', borderRadius:50, border:'none',
                  background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:600 }}>
                  <FiPhoneOff /> Cancel
                </button>
              </div>
            )}

            {/* Active call controls */}
            {callActive && callStatus !== 'calling' && (
              <div style={{ position:'absolute', bottom:16, left:'50%',
                transform:'translateX(-50%)', display:'flex', gap:10 }}>
                <button onClick={toggleMic} style={{ display:'flex', alignItems:'center',
                  gap:6, padding:'10px 18px', borderRadius:50, border:'none',
                  cursor:'pointer', fontWeight:600,
                  background: micOn ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.7)',
                  color:'#fff' }}>
                  {micOn ? <FiMic/> : <FiMicOff/>}
                </button>
                <button onClick={toggleVideo} style={{ display:'flex', alignItems:'center',
                  gap:6, padding:'10px 18px', borderRadius:50, border:'none',
                  cursor:'pointer', fontWeight:600,
                  background: videoOn ? 'rgba(255,255,255,0.2)' : 'rgba(239,68,68,0.7)',
                  color:'#fff' }}>
                  {videoOn ? <FiVideo/> : <FiVideoOff/>}
                </button>
                <button onClick={endCall} style={{ display:'flex', alignItems:'center',
                  gap:6, padding:'10px 20px', borderRadius:50, border:'none',
                  background:'rgba(239,68,68,0.8)', color:'#fff',
                  cursor:'pointer', fontWeight:700 }}>
                  <FiPhoneOff/> End Call
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── VOICE CALL PANEL ─────────────────────────────────── */}
        {type === 'call' && (
          <div style={{ flex:1, display:'flex', alignItems:'center',
            justifyContent:'center', background:'var(--bg)' }}>
            <div style={{ textAlign:'center', padding:40, maxWidth:420 }}>
              <div style={{ width:120, height:120, borderRadius:'50%',
                margin:'0 auto 20px', background:'var(--primary-light)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:44, overflow:'hidden',
                border: callStatus==='connected' ? '4px solid #10b981' : '4px solid var(--primary)',
                boxShadow: callStatus==='connected'
                  ? '0 0 30px rgba(16,185,129,0.2)' : '0 0 20px rgba(124,58,237,0.15)' }}>
                {otherParty?.avatar
                  ? <img src={otherParty.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : otherParty?.name?.[0]}
              </div>

              <h2 style={{ color:'var(--text)', fontWeight:700, marginBottom:8, fontSize:22 }}>
                {otherParty?.name}
              </h2>

              <p style={{ fontSize:15, marginBottom:32,
                color: callStatus==='connected' ? '#10b981'
                  : callStatus==='calling' ? 'var(--secondary)'
                  : callStatus==='connecting' ? 'var(--primary)' : 'var(--text-muted)' }}>
                {callStatus==='idle'        && 'Click Start Call to begin'}
                {callStatus==='calling'     && '📞 Calling... waiting for them to accept'}
                {callStatus==='connecting'  && '🔄 Connecting...'}
                {callStatus==='connected'   && '🟢 Call connected — speak now'}
                {callStatus==='ended'       && '📵 Call ended'}
              </p>

              {callStatus === 'idle' && (
                <>
                  <button onClick={startCall} style={{ display:'inline-flex',
                    alignItems:'center', gap:12, padding:'18px 40px',
                    borderRadius:50, border:'none', background:'#10b981', color:'#fff',
                    cursor:'pointer', fontWeight:700, fontSize:17 }}>
                    <FiPhone size={22}/> Start Voice Call
                  </button>
                  <p style={{ color:'#6b7280', fontSize:12, marginTop:16 }}>
                    Browser will ask for microphone permission — click Allow
                  </p>
                </>
              )}

              {callStatus === 'calling' && (
                <button onClick={endCall} style={{ display:'inline-flex',
                  alignItems:'center', gap:10, padding:'14px 28px',
                  borderRadius:50, border:'none', background:'#ef4444', color:'#fff',
                  cursor:'pointer', fontWeight:700, fontSize:15 }}>
                  <FiPhoneOff/> Cancel
                </button>
              )}

              {callActive && callStatus !== 'calling' && (
                <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
                  <button onClick={toggleMic} style={{ display:'flex', alignItems:'center',
                    gap:8, padding:'14px 24px', borderRadius:50, border:'none',
                    cursor:'pointer', fontWeight:600,
                    background: micOn ? 'var(--primary-light)' : 'rgba(239,68,68,0.1)',
                    color: micOn ? 'var(--primary)' : '#ef4444' }}>
                    {micOn ? <><FiMic/> Mute</> : <><FiMicOff/> Unmute</>}
                  </button>
                  <button onClick={endCall} style={{ display:'flex', alignItems:'center',
                    gap:10, padding:'14px 28px', borderRadius:50, border:'none',
                    background:'#ef4444', color:'#fff', cursor:'pointer', fontWeight:700 }}>
                    <FiPhoneOff/> End Call
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHAT PANEL ───────────────────────────────────────── */}
        <div style={{
          width: type === 'chat' ? '100%' : 340,
          maxWidth: type === 'chat' ? 700 : 340,
          margin: type === 'chat' ? '0 auto' : 0,
          flexShrink: 0,
          background: 'var(--card)',
          borderLeft: type !== 'chat' ? '1px solid var(--border)' : 'none',
          display: 'flex', flexDirection: 'column',
        }}>

          {/* Tabs */}
          <div style={{ display:'flex', background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
            {['chat', ...(isAstrologer ? ['notes'] : []), 'details'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding:'10px 14px', border:'none', background:'none',
                color: activeTab===tab ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab===tab ? '2px solid var(--primary)' : '2px solid transparent',
                cursor:'pointer', fontWeight:600, fontSize:13, textTransform:'capitalize',
                display:'flex', alignItems:'center', gap:5 }}>
                {tab==='chat' && <FiMessageCircle/>}
                {tab==='details' && <FiUser/>}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Chat messages */}
          {activeTab === 'chat' && (
            <>
              <div style={{ flex:1, overflowY:'auto', padding:16,
                display:'flex', flexDirection:'column', gap:10 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign:'center', color:'var(--text-muted)', marginTop:40, fontSize:13 }}>
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                  return (
                    <div key={i} style={{ display:'flex', flexDirection:'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth:'80%', padding:'9px 14px', borderRadius:16,
                        fontSize:14, lineHeight:1.5, wordBreak:'break-word',
                        color: isMe ? '#fff' : 'var(--text)',
                        background: isMe ? 'var(--primary)' : 'rgba(123, 44, 191, 0.08)',
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius:  isMe ? 16 : 4 }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize:10, color:'#6b7280', marginTop:3 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ display:'flex', gap:8, padding:12,
                borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
                <textarea rows={2}
                  placeholder={socket?.connected ? 'Type a message...' : 'Connecting...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex:1, resize:'none', background:'#fff',
                    border:'1.5px solid var(--border)', borderRadius:8,
                    color:'var(--text)', padding:'8px 12px', fontSize:13, outline:'none' }} />
                <button onClick={sendMessage}
                  disabled={!input.trim() || !socket?.connected}
                  style={{ padding:'0 16px', borderRadius:8, border:'none', fontSize:18,
                    display:'flex', alignItems:'center', color:'#fff',
                    background: input.trim() && socket?.connected ? 'var(--primary)' : 'var(--border)',
                    cursor: input.trim() && socket?.connected ? 'pointer' : 'not-allowed' }}>
                  <FiSend/>
                </button>
              </div>
            </>
          )}

          {/* Notes */}
          {activeTab === 'notes' && isAstrologer && (
            <AstrologerNotes consultationId={id} />
          )}

          {/* Details */}
          {activeTab === 'details' && (
            <div style={{ padding:16, fontSize:14, overflowY:'auto' }}>
              <h4 style={{ marginBottom:12, color:'var(--text)' }}>Client Birth Details</h4>
              {consultation.appointment?.userBirthDetails &&
                Object.entries(consultation.appointment.userBirthDetails).map(([k,v]) =>
                  v ? (
                    <div key={k} style={{ marginBottom:8 }}>
                      <span style={{ color:'var(--text-muted)', textTransform:'capitalize' }}>
                        {k.replace(/([A-Z])/g,' $1')}:{' '}
                      </span>
                      <strong style={{ color:'var(--text)' }}>{v}</strong>
                    </div>
                  ) : null
                )
              }
              {consultation.appointment?.question && (
                <div style={{ marginTop:16 }}>
                  <span style={{ color:'var(--text-muted)' }}>Question: </span>
                  <p style={{ color:'var(--text)', marginTop:4 }}>
                    {consultation.appointment.question}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Astrologer private notes ──────────────────────────────────────────────────
function AstrologerNotes({ consultationId }) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await api.put('/consultations/' + consultationId + '/notes', { notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { toast.error('Failed to save notes'); }
  };

  return (
    <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10, flex:1 }}>
      <p style={{ fontSize:12, color:'#a78bfa' }}>Private notes — only visible to you</p>
      <textarea
        style={{ flex:1, background:'#1e1b4b', border:'1px solid #4c1d95',
          borderRadius:8, color:'#e9d5ff', padding:12,
          fontSize:13, resize:'none', outline:'none' }}
        placeholder="Write your consultation notes here..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <button className="btn btn-primary" onClick={save}>
        {saved ? 'Saved!' : 'Save Notes'}
      </button>
    </div>
  );
}