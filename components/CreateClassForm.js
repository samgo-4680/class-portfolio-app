'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/teacher/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subject }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || '수업 생성에 실패했습니다.');
    setName('');
    setSubject('');
    router.push(`/teacher/classes/${data.class.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="field"><label>수업 이름</label><input required placeholder="예: 2학년 1반 한국지리" value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="field"><label>과목</label><input placeholder="예: 한국지리" value={subject} onChange={e => setSubject(e.target.value)} /></div>
      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={loading}>{loading ? '생성 중...' : '수업 만들기'}</button>
    </form>
  );
}
