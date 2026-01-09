import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const email = payload.email as string;
      navigate("/verify-otp", { state: { email } });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-none">
        <CardHeader><CardTitle className="text-2xl text-center">Create an Account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>First Name</Label><Input name="first_name" required /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input name="last_name" required /></div>
            <div className="col-span-2 space-y-2"><Label>Username</Label><Input name="username" required /></div>
            <div className="col-span-2 space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
            <div className="space-y-2"><Label>Password</Label><Input name="password" type="password" required /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input name="confirm_password" type="password" required /></div>
            <Button className="col-span-2 mt-2 bg-indigo-600" type="submit">Register</Button>
          </form>
          <p className="mt-4 text-center text-sm">Already have an account? <Link title="login" to="/login" className="text-indigo-600 hover:underline">Login</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}