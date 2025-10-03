import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/generation', label: 'Generation' },
    { path: '/batch-editing', label: 'Batch Editing' },
    { path: '/editing', label: 'Editing' },
  ];

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="px-4 py-4">
        {/* <h1 className="text-3xl font-bold text-foreground mb-4">Image Generation Studio</h1> */}
        <nav className="flex gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-6 py-3 rounded-md text-base font-bold transition-colors",
                location.pathname === link.path
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
