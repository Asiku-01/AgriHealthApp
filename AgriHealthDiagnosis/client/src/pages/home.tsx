import { NavHeader } from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Leaf, Stethoscope } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI-Powered Agricultural Health Diagnosis
          </h1>

          <p className="text-xl text-muted-foreground">
            Get instant diagnosis for plant diseases and livestock health issues using our advanced machine learning technology.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            <div className="p-6 border rounded-lg space-y-4">
              <Leaf className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Plant Disease Detection</h2>
              <p className="text-muted-foreground">
                Upload images of your plants to detect diseases and get treatment recommendations.
              </p>
              <Button asChild className="w-full">
                <Link href="/diagnose">Diagnose Plants</Link>
              </Button>
            </div>

            <div className="p-6 border rounded-lg space-y-4">
              <Stethoscope className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Livestock Health Check</h2>
              <p className="text-muted-foreground">
                Monitor your livestock health with AI-powered visual diagnosis.
              </p>
              <Button asChild className="w-full">
                <Link href="/diagnose">Check Livestock</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}