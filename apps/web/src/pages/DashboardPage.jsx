import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Card, { CardBody } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { requestsApi, transactionsApi, usersApi } from "../api/endpoints";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: myItemsData } = useQuery({ queryKey: ["my-items"], queryFn: usersApi.getMyItems });
  const { data: borrowerRequestsData } = useQuery({ queryKey: ["requests", "borrower"], queryFn: () => requestsApi.list({ role: "borrower" }) });
  const { data: lenderRequestsData } = useQuery({ queryKey: ["requests", "lender"], queryFn: () => requestsApi.list({ role: "lender" }) });
  const { data: transactionsData } = useQuery({ queryKey: ["transactions"], queryFn: () => transactionsApi.list() });
  const myItems = Array.isArray(myItemsData?.data) ? myItemsData.data : [];
  const borrowerRequests = Array.isArray(borrowerRequestsData?.data) ? borrowerRequestsData.data : [];
  const lenderRequests = Array.isArray(lenderRequestsData?.data) ? lenderRequestsData.data : [];
  const transactions = Array.isArray(transactionsData?.data) ? transactionsData.data : [];
  const pendingRequests = [...borrowerRequests, ...lenderRequests].filter((request) => request.status === "PENDING");
  const activeBorrows = transactions.filter((transaction) => ["APPROVED", "HANDOVER_PENDING", "ACTIVE", "OVERDUE", "RETURN_PENDING"].includes(transaction.status));

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
              {myItems.length}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Pending Requests
            </div>
            <div className="text-3xl font-display font-bold text-textPrimary mt-2">
              {pendingRequests.length}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Active Borrows
            </div>
            <div className="text-3xl font-display font-bold text-textPrimary mt-2">
              {activeBorrows.length}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-textSecondary font-semibold uppercase tracking-wider">
              Trust Score
            </div>
            <div className="text-3xl font-display font-bold text-trust mt-2">
              {user?.reputationScore ?? "—"}
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
        <CardBody className="py-6">
          {pendingRequests.length || activeBorrows.length ? (
            <ul className="space-y-3">
              {[...pendingRequests.map((request) => ({ id: request.id, label: `Request: ${request.item?.title || "Item"}`, status: request.status, date: request.createdAt })), ...activeBorrows.map((transaction) => ({ id: transaction.id, label: `Borrow: ${transaction.item?.title || "Item"}`, status: transaction.status, date: transaction.createdAt }))]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((activity) => (
                  <li key={activity.id} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-textPrimary">{activity.label}</span>
                    <span className="text-textSecondary">{activity.status}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="text-center">
              <p className="text-textSecondary text-sm">No requests or active borrows were returned for this account.</p>
              <Link to="/browse">
                <Button variant="ghost" className="mt-3 text-accent font-semibold">Find something to borrow</Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
