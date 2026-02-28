import { Routes, Route, Navigate } from "react-router";
import { AccountsPage } from "./pages/AccountsPage";
import { NewAccountPage } from "./pages/NewAccountPage";
import { EditAccountPage } from "./pages/EditAccountPage";
import { CategoriesPage } from "./pages/CategoriesPage";

const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f06",
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/accounts" replace />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/new" element={<NewAccountPage />} />
        <Route path="/accounts/:id/edit" element={<EditAccountPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
    </div>
  );
};

export default App;
