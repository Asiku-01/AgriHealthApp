import { NavHeader } from "@/components/nav-header";
import { DiagnosisForm } from "@/components/diagnosis-form";

export default function Diagnosis() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">New Diagnosis</h1>
          <DiagnosisForm />
        </div>
      </main>
    </div>
  );
}
