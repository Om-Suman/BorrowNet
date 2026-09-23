import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-display font-bold text-textPrimary tracking-tighter mb-4">
        404
      </h1>
      <p className="text-xl text-textSecondary mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  );
}
