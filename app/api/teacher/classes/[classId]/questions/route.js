import { NextResponse } from 'next/server';
import { requireTeacher } from '../../../../../../lib/auth';
import { db } from '../../../../../../lib/supabase';

export async function POST(request, { params }) {
  try {
    const session = await requireTeacher();
    if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { classId } = await params;
    const { prompt = '' } = await request.json();
    if (!prompt.trim()) return NextResponse.json({ error: '질문을 입력하세요.' }, { status: 400 });
    const supabase = db();
    const { data: klass } = await supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', session.userId).maybeSingle();
    if (!klass) return NextResponse.json({ error: '수업을 찾을 수 없습니다.' }, { status: 404 });
    const { data: question, error } = await supabase.from('questions').insert({ class_id: classId, prompt: prompt.trim() }).select('id,prompt,created_at').single();
    if (error) throw error;
    return NextResponse.json({ question });
  } catch (e) {
    return NextResponse.json({ error: e.message || '질문 등록에 실패했습니다.' }, { status: 500 });
  }
}
