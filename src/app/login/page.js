import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Entrar | O2 Kanban',
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
