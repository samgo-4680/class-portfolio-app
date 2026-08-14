import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireTeacher } from '../../lib/auth';
import { db } from '../../lib/supabase';
import CreateClassForm from '../../components/CreateClassForm';
import LogoutButton from '../../components/LogoutButton';

export const dynamic = 'force-dynamic';

function formatMB(bytes = 0) {
  return (Number(bytes) / 1024 / 1024).toFixed(1);
}

export default async function TeacherDashboard() {
  const session = await requireTeacher();
  if (!session) redirect('/teacher/login');

  const supabase = db();
  const [{ data: teacher }, { data: classes, error }, { data: statsRows }] = await Promise.all([
    supabase.from('teachers').select('id,name,email').eq('id', session.userId).single(),
    supabase.from('classes').select('id,name,subject,code,created_at').eq('teacher_id', session.userId).order('created_at', { ascending: false }),
    supabase.rpc('portfolio_database_stats'),
  ]);

  if (error) throw new Error(error.message);

  const stats = statsRows?.[0] || {};
  const databaseBytes = Number(stats.database_bytes || 0);
  const freeLimitBytes = 500 * 1024 * 1024;
  const usagePercent = databaseBytes ? Math.min(100, (databaseBytes / freeLimitBytes) * 100) : 0;

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

      <div className="section-title"><h2>데이터 사용량</h2><span className="badge">Supabase Free 기준</span></div>
      <div className="card">
        <div className="usage-head">
          <div>
            <div className="small muted">현재 데이터베이스</div>
            <div className="stat">{formatMB(databaseBytes)} MB <span className="stat-sub">/ 500 MB</span></div>
          </div>
          <div className="badge">{usagePercent.toFixed(1)}%</div>
        </div>
        <div className="usage-bar" aria-label={`데이터베이스 사용률 ${usagePercent.toFixed(1)}%`}>
          <div className="usage-fill" style={{ width: `${Math.max(usagePercent, 0.4)}%` }} />
        </div>
        <div className="stats-row">
          <span>교사 {stats.teacher_count || 0}명</span>
          <span>수업 {stats.class_count || 0}개</span>
          <span>학생 {stats.student_count || 0}명</span>
          <span>질문 {stats.question_count || 0}개</span>
          <span>답변 {stats.answer_count || 0}개</span>
        </div>
        <p className="small muted usage-note">용량이 커지면 학기가 끝난 수업의 Excel을 먼저 내려받은 뒤 해당 수업을 삭제해 데이터를 정리할 수 있습니다.</p>
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
