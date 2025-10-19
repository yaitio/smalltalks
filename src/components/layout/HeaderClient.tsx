import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import styles from './Header.module.css';

export interface HeaderProps {
  showUserMenu?: boolean;
}

export default function HeaderClient({ showUserMenu = true }: HeaderProps) {
  const { user, isAuthenticated, checkAuth, logout: logoutUser } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showUserMenu) {
      checkAuth();
    }
  }, [checkAuth, showUserMenu]);

  const handleLogout = async () => {
    await logoutUser();
    setShowDropdown(false);
    window.location.href = '/';
  };

  const shouldShowUserMenu = showUserMenu && isAuthenticated && user;

  if (!shouldShowUserMenu) {
    return null;
  }

  return (
    <div className={styles.userMenu}>
      <button
        type="button"
        className={styles.userButton}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <span className={styles.userAvatar}>{user.user_name?.[0] || user.user_email?.[0]}</span>
        <span className={styles.userName}>{user.user_name || user.user_email}</span>
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.dropdownEmail}>{user.email}</div>
          </div>
          <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
