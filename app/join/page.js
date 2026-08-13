import Link from 'next/link';
import StudentJoin from '../../components/StudentJoin';

export default function JoinPage() {
  return (
    <main className="shell" style={{ maxWidth: 620 }}>
      <div className="topbar"><Link href="/">← 처음으로</Link></div>
      <h1>학생 등록 / 로그인</h1>
      <p className="muted">교사가 알려준 수업 코드와 학번을 입력하세요.</p>
      <StudentJoin />
    </main>
  );
}
