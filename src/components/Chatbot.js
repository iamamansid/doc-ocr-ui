import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { addMessage, resetSession } from '../features/messagesSlice';

function Chatbot() {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messages.messages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesRef = useRef(null);
  const API_URL = 'https://spring-ai-backend-production-0a75.up.railway.app/api/webapp/v0/chatbot';

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input.trim() };

    // build payload using only user messages + new user message
    const userMessages = messages.filter((m) => m.role === 'user');
    const payload = { messages: [...userMessages, userMsg] };

    // add user message to store for immediate UI feedback
    dispatch(addMessage(userMsg));

    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(API_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data && res.data.result) {
        const assistantMsg = { role: 'assistant', content: String(res.data.response || '') };
        dispatch(addMessage(assistantMsg));
      } else {
        const errMsg = { role: 'assistant', content: 'Error: no response from chatbot.' };
        dispatch(addMessage(errMsg));
      }
    } catch (err) {
      const errMsg = { role: 'assistant', content: 'Request failed. Try again.' };
      dispatch(addMessage(errMsg));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(resetSession());
  };
  return (
    <div className={`chatbot-widget ${open ? 'open' : 'closed'} ${expanded ? 'expanded' : ''}`}>
      <button
        className="chatbot-toggle"
        aria-label="Toggle chat"
        onClick={() => setOpen((v) => !v)}
      >
        Aman's Chatbot
      </button>

      <div className="chatbot-panel card shadow" aria-hidden={!open}>
        <div className="chatbot-header d-flex align-items-center justify-content-between">
          <div className="chatbot-title">Aman's Chatbot</div>
          <div>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleRefresh}>
              Refresh
            </button>
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? 'Restore' : 'Maximize'}
            >
              {expanded ? '▢' : '▣'}
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(false)}>
              _
            </button>
          </div>
        </div>

        <div className="chatbot-body" ref={messagesRef}>
          {messages.length === 0 && (
            <div className="text-muted p-3">No messages yet. Say hi!</div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="message-content">{m.content}</div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant typing">
              <div className="message-content">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
        </div>

        <div className="chatbot-input p-3">
          <div className="input-group">
            <input
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
