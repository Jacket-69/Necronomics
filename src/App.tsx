import { Routes, Route, Navigate, NavLink } from "react-router";
import { AccountsPage } from "./pages/AccountsPage";
import { NewAccountPage } from "./pages/NewAccountPage";
import { EditAccountPage } from "./pages/EditAccountPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { TransactionsPage } from "./pages/TransactionsPage";

const navLinks = [
  { to: "/accounts", label: "Cuentas" },
  { to: "/categories", label: "Categorias" },
  { to: "/transactions", label: "Transacciones" },
];

const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f06",
      }}
    >
      {/* Navigation bar */}
      <nav
        className="flex items-center gap-1 border-b px-4 py-2"
        style={{
          backgroundColor: "#111a0a",
          borderColor: "#2a3518",
        }}
      >
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className="px-3 py-1.5 text-sm transition-colors rounded"
            style={({ isActive }) => ({
              color: isActive ? "#7fff00" : "#6b7c3e",
              fontFamily: '"Share Tech Mono", "Courier New", monospace',
              backgroundColor: isActive ? "#1a2510" : "transparent",
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/accounts" replace />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/new" element={<NewAccountPage />} />
        <Route path="/accounts/:id/edit" element={<EditAccountPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
      </Routes>
    </div>
  );
};

export default App;
