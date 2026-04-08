const ROLE = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
  STAFF: 'staff',
};

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUserRole() {
  return getStoredUser()?.role ?? ROLE.PATIENT;
}

export function canManageUsers() {
  return getUserRole() === ROLE.ADMIN;
}

/** Thêm/sửa lịch trực (backend: admin, staff, doctor) */
export function canEditDoctorSchedule() {
  const r = getUserRole();
  return r === ROLE.ADMIN || r === ROLE.STAFF || r === ROLE.DOCTOR;
}

export { ROLE };
