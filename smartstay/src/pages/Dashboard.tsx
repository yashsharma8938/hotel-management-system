import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BedDouble, Users, CalendarCheck, DollarSign, TrendingUp, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardData {
    stats: {
        totalRooms: number; availableRooms: number; occupiedRooms: number; maintenanceRooms: number;
        reservedRooms: number; totalBookings: number; activeBookings: number; totalGuests: number;
        totalStaff: number; activeStaff: number; totalRevenue: number; occupancyRate: number;
    };
    monthlyRevenue: Array<{ _id: string; revenue: number; bookings: number }>;
    recentBookings: Array<{
        _id: string; guest: { name: string; email: string }; room: { number: string; type: string };
        checkIn: string; checkOut: string; totalAmount: number; status: string;
    }>;
    roomTypeDistribution: Array<{ _id: string; count: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];

const statusColor = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
        'confirmed': 'default', 'checked-in': 'success', 'checked-out': 'secondary' as 'default', 'cancelled': 'destructive'
    };
    return map[s] || 'default';
};

export default function Dashboard() {
    const { token } = useAuth();
    const { data, isLoading } = useQuery<DashboardData>({
        queryKey: ['dashboard'],
        queryFn: () => api('/dashboard', { token }),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!data) return <div className="text-center text-muted-foreground">Failed to load dashboard.</div>;

    const { stats, monthlyRevenue, recentBookings, roomTypeDistribution } = data;
    const chartData = monthlyRevenue.map(m => ({ month: m._id, revenue: m.revenue, bookings: m.bookings }));

    const statCards = [
        { label: 'Total Rooms', value: stats.totalRooms, icon: BedDouble, color: 'from-blue-500 to-blue-600', sub: `${stats.availableRooms} available` },
        { label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: TrendingUp, color: 'from-emerald-500 to-emerald-600', sub: `${stats.occupiedRooms} occupied` },
        { label: 'Active Bookings', value: stats.activeBookings, icon: CalendarCheck, color: 'from-violet-500 to-violet-600', sub: `${stats.totalBookings} total` },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-amber-500 to-amber-600', sub: 'All time' },
        { label: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'from-cyan-500 to-cyan-600', sub: 'Registered' },
        { label: 'Active Staff', value: stats.activeStaff, icon: UserCog, color: 'from-rose-500 to-rose-600', sub: `${stats.totalStaff} total` },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here's your hotel overview.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <Card key={card.label} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{card.label}</p>
                                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                                    <card.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                    <XAxis dataKey="month" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                                    <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No revenue data yet</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Room Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {roomTypeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={roomTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                                        paddingAngle={5} dataKey="count" nameKey="_id" label={({ _id, count }) => `${_id}: ${count}`}>
                                        {roomTypeDistribution.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No room data</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentBookings.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No bookings yet</TableCell></TableRow>
                            ) : (
                                recentBookings.map((b) => (
                                    <TableRow key={b._id}>
                                        <TableCell className="font-medium">{b.guest?.name || 'N/A'}</TableCell>
                                        <TableCell>{b.room?.number} ({b.room?.type})</TableCell>
                                        <TableCell>{new Date(b.checkIn).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(b.checkOut).toLocaleDateString()}</TableCell>
                                        <TableCell>₹{b.totalAmount.toLocaleString()}</TableCell>
                                        <TableCell><Badge variant={statusColor(b.status)}>{b.status}</Badge></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
