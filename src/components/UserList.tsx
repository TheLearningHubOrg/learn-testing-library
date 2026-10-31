import { useEffect, useState } from 'react';
import type { FetchUsers, User } from '../api/users';

interface UserListProps {
  loadUsers: FetchUsers;
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; users: User[] };

export function UserList({ loadUsers }: UserListProps) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal)
      .then((users) => setState({ status: 'success', users }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' });
      });
    return () => controller.abort();
  }, [loadUsers]);

  if (state.status === 'loading') {
    return <p role="status">Loading users...</p>;
  }

  if (state.status === 'error') {
    return <p role="alert">Could not load users: {state.message}</p>;
  }

  const visible = state.users.filter((u) => u.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section aria-labelledby="users-heading">
      <h2 id="users-heading">Team members</h2>
      <label>
        Filter by name
        <input type="search" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </label>
      {visible.length === 0 ? (
        <p>No matching users</p>
      ) : (
        <ul>
          {visible.map((user) => (
            <li key={user.id}>
              {user.name} <span>({user.email})</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
