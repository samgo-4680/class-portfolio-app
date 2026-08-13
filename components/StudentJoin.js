'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const initial = { classCode: '', name: '', studentNumber: '', password: '' };

export default function StudentJoin() {
  const router = useRouter();
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch(`/api/student/${mode}`, {
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
    router.push('/student');
    router.refresh();
  }

  return (
    <div className="card">
      <div className="actions" style={{ marginBottom: 20 }}>
        <button type="button" className={`btn ${mode === 'register' ? '' : 'ghost'}`} onClick={() => { setMode('register'); setError(''); }}>새 학생 등록</button>
        <button type="button" className={`btn ${mode === 'login' ? '' : 'ghost'}`} onClick={() => { setMode('login'); setError(''); }}>기존 학생 로그인</button>
      </div>

      <form onSubmit={submit}>
        <div className="field">
          <label>수업 코드</label>
          <input required maxLength={10} placeholder="예: A7K2P9" value={form.classCode} onChange={e => setForm({ ...form, classCode: e.target.value.toUpperCase() })} />
        </div>
        {mode === 'register' && (
          <div className="field">
            <label>이름</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        <div className="field">
          <label>학번</label>
          <input required inputMode="numeric" placeholder="예: 2101" value={form.studentNumber} onChange={e => setForm({ ...form, studentNumber: e.target.value })} />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" minLength={4} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <div className="small muted">학생 본인이 기억할 수 있는 4자 이상의 비밀번호를 사용하세요.</div>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>{loading ? '처리 중...' : mode === 'register' ? '등록하고 시작하기' : '내 포트폴리오 열기'}</button>
      </form>
    </div>
  );
}
