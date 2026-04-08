import { useState } from 'react';
import { useUserStore, useUIStore } from '@/stores';
import { Card, CardContent, Button, StatusBadge, Input } from '@/components/ui';
import { Plus, Search, MoreHorizontal, UserCog, Stethoscope, UserCheck } from 'lucide-react';

const roleIcons = {
  admin: UserCog,
  doctor: Stethoscope,
  nurse: UserCheck,
};

const roleColors = {
  admin: 'bg-primary-container text-on-primary-container',
  doctor: 'bg-tertiary-fixed/10 text-tertiary-fixed',
  nurse: 'bg-secondary-container text-on-secondary-container',
};

const roleLabels = {
  admin: 'Quản trị',
  doctor: 'Bác sĩ',
  nurse: 'Điều dưỡng',
};

export function UsersPage() {
  const { users, searchTerm, setSearchTerm, filterRole, setFilterRole } = useUserStore();
  const { showToast } = useUIStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const handleAddUser = () => {
    setShowAddModal(false);
    showToast({ type: 'success', message: 'Thêm người dùng thành công' });
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-lg text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-tertiary-fixed"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'admin', 'doctor', 'nurse'].map((role) => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterRole === role
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {role === 'all' ? 'Tất cả' : roleLabels[role]}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const RoleIcon = roleIcons[user.role];
          return (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                      <span className="text-lg font-semibold text-on-primary-container">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-on-surface">{user.name}</h3>
                      <p className="text-sm text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-md hover:bg-surface-container transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <RoleIcon className="w-4 h-4 text-on-surface-variant" />
                    <span className="text-sm text-on-surface">{roleLabels[user.role]}</span>
                    <span className="text-on-surface-variant">•</span>
                    <span className="text-sm text-on-surface-variant">{user.department}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge variant={user.status}>
                      {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </StatusBadge>
                    <span className="text-xs text-on-surface-variant">
                      Tham gia: {user.joinDate}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="w-12 h-12 mx-auto mb-3 text-on-surface-variant opacity-30" />
          <p className="text-on-surface-variant">Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 w-full max-w-md card-shadow">
            <h2 className="text-headline-sm text-on-surface mb-6">Thêm người dùng mới</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
              <Input label="Họ tên" placeholder="Nhập họ tên" required />
              <Input label="Email" type="email" placeholder="Nhập email" required />
              <Input label="Số điện thoại" placeholder="Nhập số điện thoại" />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Hủy
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Thêm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
