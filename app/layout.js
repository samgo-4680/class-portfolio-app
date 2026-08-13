import './globals.css';

export const metadata = {
  title: '수업 포트폴리오',
  description: '교사 질문과 학생 답변을 누적하는 수업 포트폴리오',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
