import { NextResponse } from 'next/server';
import { requireTeacher } from '../../../../../lib/auth';
import { db } from '../../../../../lib/supabase';

export async function DELETE(request, { params }) {
  try {
    const session = await requireTeacher();
    if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

    const { classId } = await params;
    const { confirmName = '' } = await request.json();
    const supabase = db();

    const { data: klass } = await supabase
      .from('classes')
      .select('id,name,teacher_id')
      .eq('id', classId)
      .eq('teacher_id', session.userId)
      .maybeSingle();

    if (!klass) return NextResponse.json({ error: '수업을 찾을 수 없습니다.' }, { status: 404 });
    if (confirmName !== klass.name) {
      return NextResponse.json({ error: '수업 이름이 일치하지 않습니다.' }, { status: 400 });
    }

    const { error } = await supabase.from('classes').delete().eq('id', classId).eq('teacher_id', session.userId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || '수업 삭제에 실패했습니다.' }, { status: 500 });
  }
}
