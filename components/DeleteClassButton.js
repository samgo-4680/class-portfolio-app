'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteClassButton({ classId, className }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function removeClass() {
    if (confirmName !== className) {
      setError('수업 이름을 정확히 입력하세요.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/teacher/classes/${classId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '수업 삭제에 실패했습니다.');
      router.push('/teacher');
      router.refresh();
    } catch (e) {
      setError(e.message || '수업 삭제에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <button className="btn danger" type="button" onClick={() => setOpen(true)}>수업 삭제</button>;
  }

  return (
    <div className="danger-zone">
      <h3>수업을 영구 삭제할까요?</h3>
      <p className="muted small">이 수업의 학생, 질문, 답변이 모두 함께 삭제됩니다. 먼저 Excel 백업을 내려받는 것을 권장합니다.</p>
      <div className="field">
        <label htmlFor="delete-class-name">확인을 위해 수업 이름을 입력하세요</label>
        <input
          id="delete-class-name"
          value={confirmName}
          onChange={e => setConfirmName(e.target.value)}
          placeholder={className}
          autoComplete="off"
        />
      </div>
      {error && <div className="error">{error}</div>}
      <div className="actions">
        <button className="btn danger" type="button" disabled={busy || confirmName !== className} onClick={removeClass}>
          {busy ? '삭제 중...' : '영구 삭제'}
        </button>
        <button className="btn ghost" type="button" disabled={busy} onClick={() => { setOpen(false); setConfirmName(''); setError(''); }}>취소</button>
      </div>
    </div>
  );
}
