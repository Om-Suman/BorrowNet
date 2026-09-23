import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import AlertBanner from "../components/feedback/AlertBanner";
import Card, { CardBody } from "../components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      toast.success("Successfully logged in");
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-textPrimary">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-textSecondary">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-accent hover:text-accentHover"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardBody>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <AlertBanner type="error" message={error} />}

              <FormInput
                label="Email address"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FormInput
                label="Password"
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign in
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
