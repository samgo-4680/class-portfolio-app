import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireTeacher } from '../../lib/auth';
import { db } from '../../lib/supabase';
import CreateClassForm from '../../components/CreateClassForm';
import LogoutButton from '../../components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function TeacherDashboard() {
  const session = await requireTeacher();
  if (!session) redirect('/teacher/login');

  const supabase = db();
  const [{ data: teacher }, { data: classes, error }] = await Promise.all([
    supabase.from('teachers').select('id,name,email').eq('id', session.userId).single(),
    supabase.from('classes').select('id,name,subject,code,created_at').eq('teacher_id', session.userId).order('created_at', { ascending: false }),
  ]);

  if (error) throw new Error(error.message);

  return (
    <main className="shell">
      <div className="topbar">
        <div><div className="small muted">교사 관리자</div><h1>{teacher?.name || '교사'}님의 수업</h1></div>
        <LogoutButton />
      </div>

      <div className="grid two">
        <div className="card">
          <h2>새 수업 만들기</h2>
          <CreateClassForm />
        </div>
        <div className="card">
          <h2>운영 방식</h2>
          <p className="muted">수업마다 고유 참여 코드가 자동 생성됩니다. 학생은 그 코드로 가입하며 학생 수는 제한 없이 늘어날 수 있습니다.</p>
        </div>
      </div>

      <div className="section-title"><h2>내 수업</h2><span className="badge">{classes?.length || 0}개</span></div>
      <div className="grid two">
        {classes?.map(c => (
          <Link key={c.id} href={`/teacher/classes/${c.id}`} className="card">
            <div className="small muted">{c.subject || '과목 미지정'}</div>
            <h3>{c.name}</h3>
            <div className="badge code">{c.code}</div>
          </Link>
        ))}
        {!classes?.length && <div className="card muted">아직 생성한 수업이 없습니다.</div>}
      </div>
    </main>
  );
}
