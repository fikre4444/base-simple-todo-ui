import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Email is missing. Please register again.",
            });
            navigate("/register");
        }
    }, [location.state, navigate, toast]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value.replace(/\D/g, "");
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Focus next input
        if (index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
            const newOtp = [...otp];
            newOtp[index] = "";
            setOtp(newOtp);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const data = e.clipboardData.getData("text").replace(/\D/g, "").split("").slice(0, 6);
        if (data.length > 0) {
            const newOtp = [...otp];
            data.forEach((char, index) => {
                newOtp[index] = char;
            });
            setOtp(newOtp);
            // Focus last filled input or the first empty one
            const nextIndex = Math.min(data.length, 5);
            inputRefs.current[nextIndex]?.focus();
        }
    };

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast({
                variant: "destructive",
                title: "Invalid Code",
                description: "Please enter a valid 6-digit OTP.",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp?identifier=${encodeURIComponent(email)}&code=${otpCode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (response.ok) {
                toast({
                    title: "Verification Successful",
                    description: "Your email has been verified. You can now log in.",
                });
                navigate("/login");
            } else {
                const data = await response.json();
                toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: data.message || "Invalid or expired OTP code.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong. Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>.
                        Please enter it below to complete your registration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-center block text-sm font-medium text-slate-700">One-Time Password</Label>
                            <div className="flex justify-between gap-2">
                                {otp.map((data, index) => (
                                    <Input
                                        key={index}
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={1}
                                        value={data}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        onChange={(e) => handleChange(e.target, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                                    />
                                ))}
                            </div>
                        </div>
                        <Button
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-semibold"
                            type="submit"
                            disabled={loading || otp.join("").length !== 6}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Code"
                            )}
                        </Button>
                    </form>
                    <div className="mt-8 text-center text-sm">
                        <p className="text-slate-500">
                            Didn't receive the code?{" "}
                            <button
                                className="text-indigo-600 hover:underline font-semibold"
                                onClick={() => toast({ title: "Resend Requested", description: "This feature is coming soon!" })}
                            >
                                Resend Code
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
