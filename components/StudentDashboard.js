'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function AnswerCard({ item }) {
  const [text, setText] = useState(item.answer?.content || '');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!saving && item.answer?.content !== undefined) setText(item.answer.content || '');
  }, [item.answer?.content, saving]);

  async function save() {
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/student/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: item.id, content: text }),
    });
    const data = await res.json();
    setSaving(false);
    setStatus(res.ok ? '저장되었습니다.' : data.error || '저장에 실패했습니다.');
  }

  return (
    <div className="question-card">
      <div className="small muted">{new Date(item.created_at).toLocaleString('ko-KR')}</div>
      <h3>{item.prompt}</h3>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="여기에 답변을 작성하세요." />
      <div className="answer-meta">
        <span className={`small ${status.includes('저장') ? '' : 'muted'}`}>{status || (item.answer?.updated_at ? `마지막 저장 ${new Date(item.answer.updated_at).toLocaleString('ko-KR')}` : '아직 저장되지 않음')}</span>
        <button className="btn" onClick={save} disabled={saving}>{saving ? '저장 중...' : '답변 저장'}</button>
      </div>
    </div>
  );
}

export default function StudentDashboard({ student, klass }) {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);

  async function load() {
    const res = await fetch('/api/student/questions', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) {
        router.push('/join');
        return;
      }
      setError(data.error || '질문을 불러오지 못했습니다.');
      return;
    }
    setItems(data.questions || []);
    setLastSync(new Date());
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const completed = items.filter(i => i.answer?.content?.trim()).length;

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <div className="small muted">{klass.subject || '수업'} · {student.student_number}</div>
          <h1>{student.name}의 포트폴리오</h1>
          <div className="small muted">{klass.name} · 질문은 5초마다 자동으로 확인합니다.{lastSync ? ` 마지막 확인 ${lastSync.toLocaleTimeString('ko-KR')}` : ''}</div>
        </div>
        <button className="btn ghost" onClick={logout}>로그아웃</button>
      </div>

      <div className="grid two" style={{ marginBottom: 20 }}>
        <div className="card"><div className="small muted">전체 질문</div><div className="stat">{items.length}</div></div>
        <div className="card"><div className="small muted">작성 완료</div><div className="stat">{completed}</div></div>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="list">
        {items.map(item => <AnswerCard key={item.id} item={item} />)}
        {!items.length && !error && <div className="card muted">아직 교사가 등록한 질문이 없습니다. 새 질문이 등록되면 자동으로 표시됩니다.</div>}
      </div>
    </main>
  );
}
