import { NextResponse } from 'next/server';
import { requireTeacher } from '../../../../lib/auth';
import { db } from '../../../../lib/supabase';
import { randomClassCode } from '../../../../lib/utils';

export async function POST(request) {
  try {
    const session = await requireTeacher();
    if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    const { name = '', subject = '' } = await request.json();
    if (!name.trim()) return NextResponse.json({ error: '수업 이름을 입력하세요.' }, { status: 400 });
    const supabase = db();
    let code;
    for (let i = 0; i < 10; i += 1) {
      const candidate = randomClassCode();
      const { data } = await supabase.from('classes').select('id').eq('code', candidate).maybeSingle();
      if (!data) { code = candidate; break; }
    }
    if (!code) return NextResponse.json({ error: '수업 코드 생성에 실패했습니다.' }, { status: 500 });
    const { data: klass, error } = await supabase.from('classes').insert({ teacher_id: session.userId, name: name.trim(), subject: subject.trim(), code }).select('id,name,subject,code').single();
    if (error) throw error;
    return NextResponse.json({ class: klass });
  } catch (e) {
    return NextResponse.json({ error: e.message || '수업 생성에 실패했습니다.' }, { status: 500 });
  }
}
