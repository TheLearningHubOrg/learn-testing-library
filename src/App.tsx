import { Disclosure } from './components/Disclosure';
import { LoginForm } from './components/LoginForm';
import { UserList } from './components/UserList';
import { fetchUsers } from './api/users';

export function App() {
  return (
    <main>
      <h1>Testing Library Playground</h1>
      <LoginForm onSubmit={(c) => console.info('Signing in as', c.email)} />
      <Disclosure summary="Why test like a user?">
        <p>Tests that query by role and label keep passing through refactors and fail when real users would.</p>
      </Disclosure>
      <UserList loadUsers={fetchUsers} />
    </main>
  );
}
