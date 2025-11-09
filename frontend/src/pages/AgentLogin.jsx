// frontend/src/pages/AgentLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAgent } from '../services/authService';

export default function AgentLogin() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await loginAgent(fullName, idNumber);
      localStorage.setItem('agent_token', res.token);        // separate key
      localStorage.setItem('agent', JSON.stringify(res.agent));
      navigate('/agent/dashboard');
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="login-card">
      <h2>Agent Login</h2>
      <form onSubmit={handleSubmit}>
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" required />
        <input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="Personal ID number" required />
        <button type="submit">Login</button>
      </form>
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </div>
  );
}
