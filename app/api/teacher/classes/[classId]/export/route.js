import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireTeacher } from '../../../../../../lib/auth';
import { db } from '../../../../../../lib/supabase';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const session = await requireTeacher();
    if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { classId } = await params;
    const supabase = db();
    const { data: klass } = await supabase.from('classes').select('id,name,subject,code').eq('id', classId).eq('teacher_id', session.userId).maybeSingle();
    if (!klass) return NextResponse.json({ error: '수업을 찾을 수 없습니다.' }, { status: 404 });
    const [{ data: students }, { data: questions }, { data: answers }] = await Promise.all([
      supabase.from('students').select('id,name,student_number').eq('class_id', classId).order('student_number'),
      supabase.from('questions').select('id,prompt,created_at').eq('class_id', classId).order('created_at'),
      supabase.from('answers').select('question_id,student_id,content,created_at,updated_at,students!inner(class_id)').eq('students.class_id', classId),
    ]);
    const answerMap = new Map((answers || []).map(a => [`${a.student_id}:${a.question_id}`, a]));
    const rows = [];
    for (const student of students || []) {
      for (const question of questions || []) {
        const answer = answerMap.get(`${student.id}:${question.id}`);
        rows.push({
          '수업': klass.name,
          '과목': klass.subject,
          '학번': student.student_number,
          '이름': student.name,
          '질문 등록일': question.created_at ? new Date(question.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '',
          '질문': question.prompt,
          '답변': answer?.content || '',
          '답변 수정일': answer?.updated_at ? new Date(answer.updated_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) : '',
        });
      }
    }
    if (!rows.length) rows.push({ '수업': klass.name, '과목': klass.subject, '학번': '', '이름': '', '질문 등록일': '', '질문': '', '답변': '', '답변 수정일': '' });
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 70 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '전체 답변');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const safe = klass.name.replace(/[\\/:*?"<>|]/g, '_');
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`${safe}_포트폴리오.xlsx`)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Excel 파일 생성에 실패했습니다.' }, { status: 500 });
  }
}
