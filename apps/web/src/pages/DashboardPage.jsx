import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
          <p className="text-textSecondary mt-1">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex gap-3">
          <Link to="/browse"><Button variant="secondary">Browse Equipment</Button></Link>
          <Button variant="primary">List an Item</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-sm text-textSecondary font-medium">Active Listings</div>
            <div className="text-3xl font-display font-bold text-white mt-2">0</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-textSecondary font-medium">Pending Requests</div>
            <div className="text-3xl font-display font-bold text-white mt-2">0</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-textSecondary font-medium">Active Borrows</div>
            <div className="text-3xl font-display font-bold text-white mt-2">0</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-sm text-textSecondary font-medium">Trust Score</div>
            <div className="text-3xl font-display font-bold text-trust mt-2">{user?.reputationScore || 0}</div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-borderSubtle">
          <h2 className="text-lg font-medium text-white">Recent Activity</h2>
        </div>
        <CardBody className="py-12 text-center">
          <p className="text-textSecondary">No recent activity yet.</p>
          <Button variant="ghost" className="mt-4 text-accent">Find something to borrow</Button>
        </CardBody>
      </Card>
    </div>
  );
}
