import { render, screen, within, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Disclosure } from '../src/components/Disclosure';
import { LoginForm } from '../src/components/LoginForm';
import { UserList } from '../src/components/UserList';
import type { User } from '../src/api/users';

// 1. Small setup helper: render + a user-event session, the pattern recommended for every test.
function setup(ui: React.ReactElement) {
  return { user: userEvent.setup(), ...render(ui) };
}

describe('LoginForm', () => {
  it('submits the entered credentials when the form is valid', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'correct-horse' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('announces a validation error and wires it to the field', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Enter a valid email address');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter a valid email address');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the button while the request is pending and reports failure', async () => {
    let reject!: (reason: Error) => void;
    const onSubmit = vi.fn(() => new Promise<void>((_, r) => (reject = r)));
    const { user } = setup(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    reject(new Error('401'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sign in failed');
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('can be completed with the keyboard alone', async () => {
    const onSubmit = vi.fn();
    const { user } = setup(<LoginForm onSubmit={onSubmit} />);

    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();
    await user.keyboard('ada@example.com');
    await user.tab();
    await user.keyboard('correct-horse{Enter}');

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});

describe('UserList', () => {
  const users: User[] = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
    { id: 3, name: 'Alan Turing', email: 'alan@example.com' },
  ];

  it('shows a loading status, then the list', async () => {
    const loadUsers = vi.fn().mockResolvedValue(users);
    render(<UserList loadUsers={loadUsers} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading users');
    await waitForElementToBeRemoved(() => screen.queryByRole('status'));

    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { level: 2, name: 'Team members' })).toBeInTheDocument();
  });

  it('filters by name as the user types', async () => {
    const user = userEvent.setup();
    render(<UserList loadUsers={vi.fn().mockResolvedValue(users)} />);

    const search = await screen.findByRole('searchbox', { name: 'Filter by name' });
    await user.type(search, 'gr');

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Grace Hopper');

    await user.clear(search);
    await user.type(search, 'zzz');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText('No matching users')).toBeInTheDocument();
  });

  it('renders an alert when loading fails', async () => {
    render(<UserList loadUsers={vi.fn().mockRejectedValue(new Error('Network down'))} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load users: Network down');
  });

  it('aborts the request when unmounted', () => {
    const loadUsers = vi.fn((_signal?: AbortSignal) => new Promise<User[]>(() => {}));
    const { unmount } = render(<UserList loadUsers={loadUsers} />);

    const signal = loadUsers.mock.calls[0][0];
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});

describe('Disclosure', () => {
  it('toggles the panel and keeps aria-expanded in sync', async () => {
    const { user } = setup(
      <Disclosure summary="Shipping details">
        <p>Ships in two days</p>
      </Disclosure>,
    );

    const button = screen.getByRole('button', { name: 'Shipping details' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    // Hidden content is excluded from the accessibility tree, so role queries skip it.
    expect(screen.queryByRole('region', { name: 'Shipping details' })).not.toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Shipping details' })).toHaveTextContent('Ships in two days');

    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
