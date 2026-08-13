import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/supabase';
import { createSession } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { email = '', password = '' } = await request.json();
    const supabase = db();
    const { data: teacher } = await supabase.from('teachers').select('id,password_hash').eq('email', email.trim().toLowerCase()).maybeSingle();
    if (!teacher || !(await bcrypt.compare(password, teacher.password_hash))) return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    await createSession({ role: 'teacher', userId: teacher.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || '로그인에 실패했습니다.' }, { status: 500 });
  }
}
