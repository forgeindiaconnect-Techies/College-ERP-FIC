import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const SESSION_KEYS = [
  'admin_session', 'subadmin_session', 'hod_session',
  'staff_session', 'student_session', 'parent_session', 'accounts_session'
];

const TOKEN_KEYS = [
  'admin_token', 'subadmin_token', 'hod_token',
  'staff_token', 'student_token', 'parent_token', 'accounts_token'
];

const getActiveUser = () => {
  for (let i = 0; i < SESSION_KEYS.length; i++) {
    const raw = sessionStorage.getItem(SESSION_KEYS[i]);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Attach token to user object for API calls
        const token = sessionStorage.getItem(TOKEN_KEYS[i]);
        return { ...parsed, token };
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getActiveUser());

  // Re-read from sessionStorage if storage changes (e.g., after login)
  useEffect(() => {
    const handleStorage = () => {
      setUser(getActiveUser());
    };
    window.addEventListener('storage', handleStorage);
    // Also poll every 2 seconds for same-tab login/logout
    const interval = setInterval(() => {
      const current = getActiveUser();
      setUser(prev => {
        // Only update if changed
        if (JSON.stringify(prev) !== JSON.stringify(current)) return current;
        return prev;
      });
    }, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const logout = () => {
    SESSION_KEYS.forEach(k => sessionStorage.removeItem(k));
    TOKEN_KEYS.forEach(k => sessionStorage.removeItem(k));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
