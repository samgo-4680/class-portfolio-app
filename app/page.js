import Link from 'next/link';
import { getSession } from '../lib/auth';

export default async function Home() {
  const session = await getSession();
  const dashboard = session?.role === 'teacher' ? '/teacher' : session?.role === 'student' ? '/student' : null;

  return (
    <main className="shell">
      <section className="hero">
        <div className="kicker">Class Portfolio</div>
        <h1>수업 포트폴리오</h1>
        <p>
          교사는 여러 수업을 만들고 질문을 등록할 수 있습니다. 학생은 수업 코드와 학번으로 가입해
          답변을 계속 누적하고, 교사는 학기 말에 전체 답변을 Excel 파일로 내려받을 수 있습니다.
        </p>
      </section>

      {dashboard && (
        <div className="card" style={{ marginBottom: 16 }}>
          <strong>로그인된 계정이 있습니다.</strong>
          <div className="actions" style={{ marginTop: 12 }}>
            <Link className="btn" href={dashboard}>내 화면으로 이동</Link>
          </div>
        </div>
      )}

      <div className="grid two">
        <div className="card">
          <h2>학생</h2>
          <p className="muted">수업 코드를 입력해 새로 등록하거나 기존 포트폴리오에 로그인합니다.</p>
          <Link className="btn" href="/join">학생 등록 / 로그인</Link>
        </div>
        <div className="card">
          <h2>교사</h2>
          <p className="muted">수업을 만들고 질문, 학생, 답변을 한 곳에서 관리합니다.</p>
          <div className="actions">
            <Link className="btn" href="/teacher/login">교사 로그인</Link>
            <Link className="btn secondary" href="/teacher/register">교사 회원가입</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
