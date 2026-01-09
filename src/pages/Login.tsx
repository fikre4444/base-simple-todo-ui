import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { saveTokens } from "@/lib/auth-store";
import { API_BASE_URL } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast"; // Import hook
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    formData.forEach((value, key) => params.append(key, value as string));

    try {
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
      //   body: params,
      // });

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
        credentials: "include", // <--- THIS IS REQUIRED to save the cookies!
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Login successful. Redirecting...",
        });
        saveTokens(data.access_token, data.refresh_token);
        navigate("/dashboard");
      } else {
        if (data.code === "verify.email") {
          const email = params.get("username");
          toast({
            title: "Verification Required",
            description: "Please verify your email to continue.",
          });
          navigate("/verify-otp", { state: { email } });
          return;
        }

        // Handle the specific error format: {"code":"...", "message":"..."}
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: data.message || "Something went wrong",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the server.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10"><LoadingSpinner /></div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="admin@sample.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Don't have an account? <Link title="register" to="/register" className="text-indigo-600 hover:underline">Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}