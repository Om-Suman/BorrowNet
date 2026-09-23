import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Card, { CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-textPrimary">
            Dashboard
          </h1>
          <p className="text-textSecondary mt-1 text-sm">
            Welcome back, {user?.name}!
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/browse">
            <Button variant="secondary">Browse Equipment</Button>
          </Link>
          <Button variant="primary">List an Item</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Active Listings
            </div>
            <div className="text-3xl font-display font-bold text-textPrimary mt-2">
              0
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Pending Requests
            </div>
            <div className="text-3xl font-display font-bold text-textPrimary mt-2">
              0
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Active Borrows
            </div>
            <div className="text-3xl font-display font-bold text-textPrimary mt-2">
              0
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Trust Score
            </div>
            <div className="text-3xl font-display font-bold text-trust mt-2">
              {user?.reputationScore || 0}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-3.5 border-b border-borderSubtle">
          <h2 className="text-sm font-display font-bold text-textPrimary uppercase tracking-wider">
            Recent Activity
          </h2>
        </div>
        <CardBody className="py-12 text-center">
          <p className="text-textSecondary text-sm">No recent activity yet.</p>
          <Link to="/browse">
            <Button variant="ghost" className="mt-3 text-accent font-semibold">
              Find something to borrow
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
