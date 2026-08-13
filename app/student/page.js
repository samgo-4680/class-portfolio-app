import { redirect } from 'next/navigation';
import { requireStudent } from '../../lib/auth';
import { db } from '../../lib/supabase';
import StudentDashboard from '../../components/StudentDashboard';

export const dynamic = 'force-dynamic';

export default async function StudentPage() {
  const session = await requireStudent();
  if (!session) redirect('/join');
  const supabase = db();
  const [{ data: student }, { data: klass }] = await Promise.all([
    supabase.from('students').select('id,name,student_number,class_id').eq('id', session.userId).single(),
    supabase.from('classes').select('id,name,subject,code').eq('id', session.classId).single(),
  ]);
  if (!student || !klass) redirect('/join');
  return <StudentDashboard student={student} klass={klass} />;
}
