export default function LoadingSkeleton({ variant = 'text', count = 1, className = '' }) {
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-48 w-full rounded-lg',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div 
          key={i} 
          className={`animate-pulse bg-surfaceElevated ${variants[variant]} ${className} ${i > 0 ? 'mt-4' : ''}`} 
        />
      ))}
    </>
  );
}
