import Link from 'next/link';
import AuthForm from '../../../components/AuthForm';

export default function TeacherRegister() {
  return (
    <main className="shell" style={{ maxWidth: 560 }}>
      <div className="topbar"><Link href="/">← 처음으로</Link></div>
      <div className="card">
        <h1>교사 회원가입</h1>
        <AuthForm mode="register" />
        <p className="small muted">이미 계정이 있나요? <Link href="/teacher/login"><strong>로그인</strong></Link></p>
      </div>
    </main>
  );
}
