import Link from 'next/link';
import AuthForm from '../../../components/AuthForm';

export default function TeacherLogin() {
  return (
    <main className="shell" style={{ maxWidth: 560 }}>
      <div className="topbar"><Link href="/">← 처음으로</Link></div>
      <div className="card">
        <h1>교사 로그인</h1>
        <AuthForm mode="login" />
        <p className="small muted">계정이 없나요? <Link href="/teacher/register"><strong>회원가입</strong></Link></p>
      </div>
    </main>
  );
}
