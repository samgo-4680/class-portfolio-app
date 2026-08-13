import { NextResponse } from 'next/server';
import { requireStudent } from '../../../../lib/auth';
import { db } from '../../../../lib/supabase';

export async function POST(request) {
  try {
    const session = await requireStudent();
    if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { questionId = '', content = '' } = await request.json();
    if (!questionId) return NextResponse.json({ error: '질문 정보가 없습니다.' }, { status: 400 });
    const supabase = db();
    const { data: question } = await supabase.from('questions').select('id').eq('id', questionId).eq('class_id', session.classId).maybeSingle();
    if (!question) return NextResponse.json({ error: '해당 수업의 질문이 아닙니다.' }, { status: 403 });
    const now = new Date().toISOString();
    const { data: answer, error } = await supabase.from('answers').upsert({ question_id: questionId, student_id: session.userId, content: String(content), updated_at: now }, { onConflict: 'question_id,student_id' }).select('id,content,updated_at').single();
    if (error) throw error;
    return NextResponse.json({ answer });
  } catch (e) {
    return NextResponse.json({ error: e.message || '답변 저장에 실패했습니다.' }, { status: 500 });
  }
}
