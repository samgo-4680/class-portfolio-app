import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/supabase';
import { createSession } from '../../../../lib/auth';
import { validPassword } from '../../../../lib/utils';

export async function POST(request) {
  try {
    const { name = '', email = '', password = '' } = await request.json();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !validPassword(password)) return NextResponse.json({ error: '이름, 이메일, 4자 이상의 비밀번호를 입력하세요.' }, { status: 400 });
    const supabase = db();
    const { data: existing } = await supabase.from('teachers').select('id').eq('email', cleanEmail).maybeSingle();
    if (existing) return NextResponse.json({ error: '이미 가입된 이메일입니다.' }, { status: 409 });
    const password_hash = await bcrypt.hash(password, 12);
    const { data: teacher, error } = await supabase.from('teachers').insert({ name: name.trim(), email: cleanEmail, password_hash }).select('id,name,email').single();
    if (error) throw error;
    await createSession({ role: 'teacher', userId: teacher.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || '회원가입에 실패했습니다.' }, { status: 500 });
  }
}
