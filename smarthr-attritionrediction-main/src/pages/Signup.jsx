import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowRight, Activity } from "lucide-react";
import { signup, sendOtp, verifyOtp } from "@/services/api";

export default function Signup() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [otp, setOtp] = useState("");
    const [signupMode, setSignupMode] = useState("password"); // "password" or "otp"
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            if (signupMode === "password") {
                if (formData.password !== formData.confirmPassword) {
                    toast.error("Passwords do not match");
                    return;
                }
                await signup({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });
                toast.success("Account created! Please log in.");
                navigate("/login");
            } else {
                await verifyOtp(formData.email, otp, "signup", {
                    username: formData.username,
                    password: formData.password
                });
                toast.success("Account created & verified!");
                navigate("/");
            }
        } catch (error) {
            toast.error(error.message || "Failed to create account.");
        } finally {
            setIsLoading(false);
        }
    };

    const startMailSignup = async () => {
        if (!formData.email) {
            toast.error("Please enter your email first");
            return;
        }
        setIsLoading(true);
        try {
            const res = await sendOtp(formData.email, "signup");
            setSignupMode("otp");
            setOtpSent(true);
            if (res && res.previewUrl) {
                toast.success("Check the newly opened tab for your verification code (Ethereal Mail)", { duration: 5000 });
                window.open(res.previewUrl, "_blank");
            } else if (res && res.testCode) {
                toast.success(`Mock Email generated! Your code is: ${res.testCode}`, { duration: 10000 });
            } else {
                toast.success("Verification code sent to your email!");
            }
        } catch (error) {
            toast.error("Failed to send verification code");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left Side - Brand/Illustration (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary/90 via-primary to-primary/70 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 z-0 mask-image-opacity-50"></div>
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl z-0"></div>
                <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white/10 blur-3xl z-0"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-lg">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">RetainIQ™</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
                        Start Optimizing Your<br />Workforce Today
                    </h1>
                    <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                        Join the platform that helps proactive HR teams anticipate challenges and improve employee satisfaction.
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm font-medium bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
                        <div className="flex -space-x-2">
                            <img className="w-8 h-8 rounded-full border-2 border-primary" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4" alt="User 1"/>
                            <img className="w-8 h-8 rounded-full border-2 border-primary" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede" alt="User 2"/>
                            <img className="w-8 h-8 rounded-full border-2 border-primary" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffd5dc" alt="User 3"/>
                        </div>
                        <span>Trusted by 500+ HR Teams</span>
                    </div>
                </div>
                
                <div className="relative z-10 text-sm text-primary-foreground/60">
                    © 2026 RetainIQ™ Analytics. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                {/* Mobile Logo */}
                <div className="w-full max-w-md mb-8 lg:hidden flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <Activity className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold text-foreground tracking-tight">RetainIQ™</span>
                </div>

                <div className="w-full max-w-md space-y-8 my-auto">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create an account</h2>
                        <p className="text-muted-foreground">
                            Enter your details below to get started
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2 group">
                            <Label htmlFor="username" className="text-sm font-medium transition-colors group-focus-within:text-primary">Full Name</Label>
                            <Input
                                id="username"
                                placeholder="John Doe"
                                value={formData.username}
                                onChange={handleChange}
                                className="h-11 px-4 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-xl"
                                required
                                disabled={otpSent}
                            />
                        </div>
                        <div className="space-y-2 group">
                            <Label htmlFor="email" className="text-sm font-medium transition-colors group-focus-within:text-primary">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="h-11 px-4 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-xl"
                                required
                                disabled={otpSent}
                            />
                        </div>

                        {signupMode === "password" ? (
                            <>
                                <div className="space-y-2 group">
                                    <Label htmlFor="password" className="text-sm font-medium transition-colors group-focus-within:text-primary">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-11 px-4 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium transition-colors group-focus-within:text-primary">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="h-11 px-4 bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all rounded-xl"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 group animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="otp" className="text-sm font-medium text-primary">Verification Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="h-11 px-4 bg-primary/5 border-primary/20 focus:bg-background focus:border-primary transition-all rounded-xl text-center text-lg tracking-widest font-bold"
                                    required
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    We've sent a code to your inbox. 
                                    <button type="button" onClick={() => {setSignupMode("password"); setOtpSent(false);}} className="ml-1 text-primary hover:underline font-medium">Use password instead</button>
                                </p>
                            </div>
                        )}
                        
                        <Button 
                            className="w-full h-12 mt-2 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" 
                            type="submit" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {signupMode === "password" ? "Creating account..." : "Verifying Code..."}
                                </>
                            ) : (
                                <>
                                    {signupMode === "password" ? "Create Account" : "Verify & Enter"} <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or sign up with mail</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Button 
                            variant="outline" 
                            className="h-11 rounded-xl border-muted hover:bg-muted/50 transition-all font-medium"
                            onClick={startMailSignup}
                            type="button"
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Continue with Email OTP
                        </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
                            Sign in to your account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
