
export default function Footer() {
  return (
    <footer className="bg-surface border-t border-borderSubtle py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <p className="text-sm text-textSecondary">
              &copy; 2026 BorrowNet. Peer-to-Peer Equipment Sharing.
            </p>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 space-x-6">
            <a href="#" className="text-sm text-textSecondary hover:text-textPrimary">About</a>
            <a href="#" className="text-sm text-textSecondary hover:text-textPrimary">Terms</a>
            <a href="#" className="text-sm text-textSecondary hover:text-textPrimary">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
