import { Routes, Route, Navigate } from "react-router";
import { AccountsPage } from "./pages/AccountsPage";

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
        <Route
          path="/accounts/new"
          element={
            <div style={{ color: "#a8b878", padding: "2rem" }}>
              Nueva cuenta
            </div>
          }
        />
        <Route
          path="/accounts/:id/edit"
          element={
            <div style={{ color: "#a8b878", padding: "2rem" }}>
              Editar cuenta
            </div>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
