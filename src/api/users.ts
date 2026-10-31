export interface User {
  id: number;
  name: string;
  email: string;
}

export type FetchUsers = (signal?: AbortSignal) => Promise<User[]>;

// Default implementation used by the real app. Tests inject their own fetcher instead.
export const fetchUsers: FetchUsers = async (signal) => {
  const response = await fetch('/api/users', { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as User[];
};
