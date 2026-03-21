import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Star } from 'lucide-react';
import hotelLobby from '@/assets/hotel-lobby.jpg';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
            } else {
                await login(form.email, form.password);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0c0a08]">
            {/* Left — Hotel Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img src={hotelLobby} alt="Luxury Hotel Lobby" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
                    <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        SmartStay
                    </h1>
                    <p className="text-lg text-amber-100/80 max-w-md">
                        Experience luxury redefined. Premium hotel management for the modern era.
                    </p>
                </div>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                        </div>
                        <h1 className="text-3xl font-bold text-amber-50" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>SmartStay</h1>
                        <p className="text-sm text-amber-200/50 mt-1">Premium Hotel Management</p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-amber-50" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-amber-200/40 mt-1">
                            {isRegister ? 'Join SmartStay to start booking luxury rooms' : 'Sign in to continue to your dashboard'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-amber-200/70 text-xs uppercase tracking-wider">Full Name</Label>
                                <Input id="name" placeholder="John Doe" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="bg-white/[0.04] border-amber-500/20 text-amber-50 placeholder:text-amber-200/20 focus:border-amber-500/50 focus:ring-amber-500/20 h-12" />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-amber-200/70 text-xs uppercase tracking-wider">Email Address</Label>
                            <Input id="email" type="email" placeholder="you@example.com" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="bg-white/[0.04] border-amber-500/20 text-amber-50 placeholder:text-amber-200/20 focus:border-amber-500/50 focus:ring-amber-500/20 h-12" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-amber-200/70 text-xs uppercase tracking-wider">Password</Label>
                            <Input id="password" type="password" placeholder="••••••••" required value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="bg-white/[0.04] border-amber-500/20 text-amber-50 placeholder:text-amber-200/20 focus:border-amber-500/50 focus:ring-amber-500/20 h-12" />
                        </div>
                        {isRegister && (
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-amber-200/70 text-xs uppercase tracking-wider">Phone (optional)</Label>
                                <Input id="phone" placeholder="+91 9876543210" value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="bg-white/[0.04] border-amber-500/20 text-amber-50 placeholder:text-amber-200/20 focus:border-amber-500/50 focus:ring-amber-500/20 h-12" />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                        )}

                        <Button type="submit" disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 text-black font-semibold shadow-lg shadow-amber-600/20 transition-all duration-300 text-sm uppercase tracking-wider">
                            {loading ? (
                                <span className="animate-spin mr-2">⏳</span>
                            ) : isRegister ? (
                                <UserPlus className="w-4 h-4 mr-2" />
                            ) : (
                                <LogIn className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                        </Button>

                        <div className="text-center text-sm text-amber-200/40">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}
                                className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                                {isRegister ? 'Sign In' : 'Register'}
                            </button>
                        </div>

                        {/* Quick login hints */}
                        <div className="pt-6 border-t border-amber-500/10">
                            <p className="text-xs text-amber-200/30 text-center mb-3 uppercase tracking-wider">Quick Access</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button"
                                    onClick={() => { setForm({ ...form, email: 'admin@smartstay.com', password: 'admin123' }); setIsRegister(false); }}
                                    className="text-xs px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-amber-300/70 hover:text-amber-200 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all">
                                    👨‍💼 Admin Login
                                </button>
                                <button type="button"
                                    onClick={() => { setForm({ ...form, email: 'rahul@example.com', password: 'customer123' }); setIsRegister(false); }}
                                    className="text-xs px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 text-amber-300/70 hover:text-amber-200 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all">
                                    🧑 Customer Login
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
