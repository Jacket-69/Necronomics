import { useNavigate } from "react-router";
import { AccountForm } from "../components/accounts/AccountForm";

export const NewAccountPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Cinzel Decorative", Georgia, serif',
        }}
      >
        Nueva Cuenta
      </h1>
      <AccountForm
        mode="create"
        defaultValues={{ currencyId: "cur_clp" }}
        onSuccess={() => navigate("/accounts")}
      />
    </div>
  );
};
