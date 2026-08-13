'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/api/teacher/${isRegister ? 'register' : 'login'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '처리 중 오류가 발생했습니다.');
      return;
    }

    router.push('/teacher');
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      {isRegister && (
        <div className="field">
          <label>교사 이름</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
      )}
      <div className="field">
        <label>이메일</label>
        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="field">
        <label>비밀번호</label>
        <input type="password" minLength={4} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <div className="small muted">4자 이상 입력하세요.</div>
      </div>
      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={loading}>{loading ? '처리 중...' : isRegister ? '회원가입' : '로그인'}</button>
    </form>
  );
}
