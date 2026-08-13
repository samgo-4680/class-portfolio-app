'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewQuestionForm({ classId }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    const res = await fetch(`/api/teacher/classes/${classId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || '질문 등록에 실패했습니다.');
    setPrompt('');
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <div className="field"><label>새 질문</label><textarea required placeholder="학생들에게 제시할 질문을 입력하세요." value={prompt} onChange={e => setPrompt(e.target.value)} /></div>
      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={loading}>{loading ? '등록 중...' : '질문 등록'}</button>
    </form>
  );
}
