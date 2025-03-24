import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function NavHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 text-xl font-semibold">
            <Leaf className="h-6 w-6 text-primary" />
            <span>Agri-Health</span>
          </a>
        </Link>
        
        <nav className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/diagnose">New Diagnosis</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
