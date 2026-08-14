import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireTeacher } from '../../../../lib/auth';
import { db } from '../../../../lib/supabase';
import { formatKoreanDate } from '../../../../lib/utils';
import NewQuestionForm from '../../../../components/NewQuestionForm';
import LogoutButton from '../../../../components/LogoutButton';
import DeleteClassButton from '../../../../components/DeleteClassButton';

export const dynamic = 'force-dynamic';

export default async function ClassDetail({ params }) {
  const session = await requireTeacher();
  if (!session) redirect('/teacher/login');
  const { classId } = await params;
  const supabase = db();

  const { data: klass } = await supabase
    .from('classes')
    .select('id,name,subject,code,teacher_id,created_at')
    .eq('id', classId)
    .eq('teacher_id', session.userId)
    .maybeSingle();
  if (!klass) notFound();

  const [{ data: students }, { data: questions }, { data: answers }] = await Promise.all([
    supabase.from('students').select('id,name,student_number,created_at').eq('class_id', classId).order('student_number'),
    supabase.from('questions').select('id,prompt,created_at').eq('class_id', classId).order('created_at', { ascending: false }),
    supabase.from('answers').select('id,question_id,student_id,content,updated_at,students!inner(class_id)').eq('students.class_id', classId),
  ]);

  const answerMap = new Map((answers || []).map(a => [`${a.student_id}:${a.question_id}`, a]));
  const totalPossible = (students?.length || 0) * (questions?.length || 0);
  const completed = (answers || []).filter(a => a.content.trim()).length;

  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link className="small muted" href="/teacher">← 수업 목록</Link>
          <h1>{klass.name}</h1>
          <div className="actions"><span className="badge">{klass.subject || '과목 미지정'}</span><span className="badge code">참여 코드 {klass.code}</span></div>
        </div>
        <LogoutButton />
      </div>

      <div className="grid two">
        <div className="card"><div className="small muted">등록 학생</div><div className="stat">{students?.length || 0}</div><div className="small muted">학생이 직접 등록하면 자동으로 증가합니다.</div></div>
        <div className="card"><div className="small muted">답변 진행</div><div className="stat">{completed} / {totalPossible}</div><div className="small muted">작성된 답변 / 전체 가능한 답변</div></div>
      </div>

      <div className="section-title"><h2>질문 등록</h2></div>
      <div className="card"><NewQuestionForm classId={classId} /></div>

      <div className="section-title">
        <h2>질문 목록</h2>
        <a className="btn secondary" href={`/api/teacher/classes/${classId}/export`}>전체 답변 Excel 다운로드</a>
      </div>
      <div className="list">
        {questions?.map((q, i) => (
          <div className="question-card" key={q.id}>
            <div className="small muted">질문 {questions.length - i} · {formatKoreanDate(q.created_at)}</div>
            <h3>{q.prompt}</h3>
            <div className="small muted">답변 {(answers || []).filter(a => a.question_id === q.id && a.content.trim()).length} / {students?.length || 0}</div>
          </div>
        ))}
        {!questions?.length && <div className="card muted">아직 등록한 질문이 없습니다.</div>}
      </div>

      <div className="section-title"><h2>학생별 포트폴리오 현황</h2></div>
      <div className="card scroll">
        <table>
          <thead><tr><th>학번</th><th>이름</th><th>답변 수</th><th>최근 답변</th></tr></thead>
          <tbody>
            {students?.map(s => {
              const mine = (answers || []).filter(a => a.student_id === s.id && a.content.trim());
              const latest = mine.sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
              return <tr key={s.id}><td>{s.student_number}</td><td>{s.name}</td><td>{mine.length} / {questions?.length || 0}</td><td>{latest ? formatKoreanDate(latest.updated_at) : '-'}</td></tr>;
            })}
            {!students?.length && <tr><td colSpan="4" className="muted">등록한 학생이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-title"><h2>전체 답변 보기</h2></div>
      <div className="card scroll">
        <table>
          <thead><tr><th>학번</th><th>이름</th><th>질문</th><th>답변</th><th>수정 시각</th></tr></thead>
          <tbody>
            {students?.flatMap(s => (questions || []).map(q => {
              const a = answerMap.get(`${s.id}:${q.id}`);
              return <tr key={`${s.id}-${q.id}`}><td>{s.student_number}</td><td>{s.name}</td><td style={{ minWidth: 240 }}>{q.prompt}</td><td style={{ minWidth: 320 }}>{a?.content || ''}</td><td>{a ? formatKoreanDate(a.updated_at) : '-'}</td></tr>;
            }))}
          </tbody>
        </table>
      </div>

      <div className="section-title"><h2>데이터 관리</h2></div>
      <div className="card">
        <h3>학기 종료 후 정리</h3>
        <p className="muted">수업을 삭제하기 전에 Excel 파일을 내려받아 보관하세요. 수업을 삭제하면 이 수업의 학생, 질문, 답변이 모두 영구 삭제됩니다.</p>
        <div className="actions data-actions">
          <a className="btn secondary" href={`/api/teacher/classes/${classId}/export`}>Excel 백업</a>
          <DeleteClassButton classId={classId} className={klass.name} />
        </div>
      </div>
    </main>
  );
}
