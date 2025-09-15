import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-6 flex-1">
        <Outlet />
      </main>
      <footer className="text-center text-sm text-gray-500 py-4">© Cryptofollow</footer>
    </div>
  );
}

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
      isActive ? 'font-semibold text-blue-600 dark:text-blue-300' : ''
    }`;

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/50 backdrop-blur">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-bold">Cryptofollow</div>
        <div className="space-x-2 flex items-center">
          <NavLink to="/" className={linkClass} end>
            Accueil
          </NavLink>
          <NavLink to="/transactions" className={linkClass}>
            Transactions
          </NavLink>
          <NavLink to="/alerts" className={linkClass}>
            Alertes
          </NavLink>
          {!isAuthenticated ? (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
