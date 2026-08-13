import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/supabase';
import { createSession } from '../../../../lib/auth';
import { normalizeCode, normalizeStudentNumber, validPassword } from '../../../../lib/utils';

export async function POST(request) {
  try {
    const { classCode = '', name = '', studentNumber = '', password = '' } = await request.json();
    const code = normalizeCode(classCode);
    const number = normalizeStudentNumber(studentNumber);
    if (!code || !name.trim() || !number || !validPassword(password)) return NextResponse.json({ error: '수업 코드, 이름, 학번, 4자 이상의 비밀번호를 입력하세요.' }, { status: 400 });
    const supabase = db();
    const { data: klass } = await supabase.from('classes').select('id').eq('code', code).maybeSingle();
    if (!klass) return NextResponse.json({ error: '존재하지 않는 수업 코드입니다.' }, { status: 404 });
    const { data: existing } = await supabase.from('students').select('id').eq('class_id', klass.id).eq('student_number', number).maybeSingle();
    if (existing) return NextResponse.json({ error: '이미 등록된 학번입니다. 기존 학생 로그인 탭을 이용하세요.' }, { status: 409 });
    const password_hash = await bcrypt.hash(password, 12);
    const { data: student, error } = await supabase.from('students').insert({ class_id: klass.id, name: name.trim(), student_number: number, password_hash }).select('id').single();
    if (error) throw error;
    await createSession({ role: 'student', userId: student.id, classId: klass.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || '학생 등록에 실패했습니다.' }, { status: 500 });
  }
}
