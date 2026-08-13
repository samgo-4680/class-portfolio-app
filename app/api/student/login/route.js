import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/supabase';
import { createSession } from '../../../../lib/auth';
import { normalizeCode, normalizeStudentNumber } from '../../../../lib/utils';

export async function POST(request) {
  try {
    const { classCode = '', studentNumber = '', password = '' } = await request.json();
    const code = normalizeCode(classCode);
    const number = normalizeStudentNumber(studentNumber);
    const supabase = db();
    const { data: klass } = await supabase.from('classes').select('id').eq('code', code).maybeSingle();
    if (!klass) return NextResponse.json({ error: '수업 코드를 확인하세요.' }, { status: 401 });
    const { data: student } = await supabase.from('students').select('id,password_hash').eq('class_id', klass.id).eq('student_number', number).maybeSingle();
    if (!student || !(await bcrypt.compare(password, student.password_hash))) return NextResponse.json({ error: '학번 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    await createSession({ role: 'student', userId: student.id, classId: klass.id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message || '로그인에 실패했습니다.' }, { status: 500 });
  }
}
