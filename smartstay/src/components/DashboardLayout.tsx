import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, BedDouble, Users, CalendarCheck, UserCog, LogOut, Home, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
    { to: '/admin/guests', icon: Users, label: 'Guests' },
    { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
    { to: '/admin/staff', icon: UserCog, label: 'Staff' },
];

const customerLinks = [
    { to: '/customer', icon: Home, label: 'Browse Rooms', end: true },
    { to: '/customer/bookings', icon: CalendarCheck, label: 'My Bookings' },
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = user?.role === 'admin' ? adminLinks : customerLinks;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-amber-500/10 bg-[#0e0c09] flex flex-col">
                <div className="p-6 border-b border-amber-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-600/20">
                            <Star className="w-5 h-5 text-black fill-black" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight text-amber-50" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>SmartStay</h1>
                            <p className="text-xs text-amber-400/50 capitalize">{user?.role} Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-amber-600/20 to-yellow-600/10 text-amber-300 border border-amber-500/20 shadow-sm'
                                    : 'text-amber-200/40 hover:text-amber-200/70 hover:bg-amber-500/5'
                                }`
                            }
                        >
                            <link.icon className="w-4 h-4" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-amber-500/10 space-y-3">
                    <div className="flex items-center gap-3 px-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-amber-100">{user?.name}</p>
                            <p className="text-xs text-amber-200/30 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-amber-200/30 hover:text-red-400 hover:bg-red-500/5" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
