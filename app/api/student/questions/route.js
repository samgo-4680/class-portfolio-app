import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../lib/auth';
import { db } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireStudent();
    if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const supabase = db();
    const [{ data: questions, error: qError }, { data: answers, error: aError }] = await Promise.all([
      supabase.from('questions').select('id,prompt,created_at').eq('class_id', session.classId).order('created_at', { ascending: false }),
      supabase.from('answers').select('question_id,content,updated_at').eq('student_id', session.userId),
    ]);
    if (qError) throw qError;
    if (aError) throw aError;
    const answerByQuestion = new Map((answers || []).map(a => [a.question_id, a]));
    return NextResponse.json({ questions: (questions || []).map(q => ({ ...q, answer: answerByQuestion.get(q.id) || null })) });
  } catch (e) {
    return NextResponse.json({ error: e.message || '질문을 불러오지 못했습니다.' }, { status: 500 });
  }
}
