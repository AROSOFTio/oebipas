import { useEffect, useState } from 'react';
import AlertMessage from '../../components/common/AlertMessage';
import DataTable from '../../components/common/DataTable';
import LoadingState from '../../components/common/LoadingState';
import PageHeader from '../../components/common/PageHeader';
import { fetchUsers } from '../../services/userService';
import { titleCase } from '../../utils/formatters';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role', render: (user) => user.role?.name || '-' },
  { key: 'status', label: 'Status', type: 'status' },
];

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError('');

      try {
        const response = await fetchUsers();
        setUsers(response);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <section className="table-card list-stack">
      <PageHeader
        title="Users"
        subtitle="Administrative user registry for billing, helpdesk, and customer-linked accounts."
      />
      <AlertMessage tone="error">{error}</AlertMessage>
      <DataTable columns={columns} rows={users.map((user) => ({ ...user, status: titleCase(user.status) }))} />
    </section>
  );
}