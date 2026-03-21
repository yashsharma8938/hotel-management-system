import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, CheckCircle, XCircle, LogIn as LogInIcon, LogOut as LogOutIcon } from 'lucide-react';

interface Booking {
    _id: string;
    guest: { _id: string; name: string; email: string; phone: string };
    room: { _id: string; number: string; type: string; price: number; floor: number };
    checkIn: string; checkOut: string; guests: number; totalAmount: number;
    status: string; paymentStatus: string; specialRequests: string; createdAt: string;
}

const statusBadge = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
        confirmed: 'default', 'checked-in': 'success', 'checked-out': 'secondary' as 'default', cancelled: 'destructive'
    };
    return map[s] || 'default';
};

const paymentBadge = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive'> = {
        paid: 'success', pending: 'warning', refunded: 'destructive'
    };
    return map[s] || 'warning';
};

export default function Bookings() {
    const { token, user } = useAuth();
    const qc = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('all');
    const isAdmin = user?.role === 'admin';

    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: () => api('/bookings', { token }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: Record<string, string> }) =>
            api(`/bookings/${id}`, { method: 'PUT', token, body }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); qc.invalidateQueries({ queryKey: ['rooms'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) => api(`/bookings/${id}`, { method: 'DELETE', token }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); qc.invalidateQueries({ queryKey: ['rooms'] }); },
    });

    const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter);

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{isAdmin ? 'Bookings' : 'My Bookings'}</h1>
                    <p className="text-muted-foreground mt-1">{isAdmin ? 'Manage all hotel bookings' : 'Your booking history'}</p>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Bookings</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="checked-in">Checked In</SelectItem>
                        <SelectItem value="checked-out">Checked Out</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {isAdmin && <TableHead>Guest</TableHead>}
                                <TableHead>Room</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                                    <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />No bookings found
                                </TableCell></TableRow>
                            ) : filtered.map(b => (
                                <TableRow key={b._id}>
                                    {isAdmin && <TableCell className="font-medium">{b.guest?.name || 'N/A'}</TableCell>}
                                    <TableCell>
                                        <div>
                                            <span className="font-bold">Room {b.room?.number}</span>
                                            <span className="text-xs text-muted-foreground ml-1 capitalize">({b.room?.type})</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(b.checkIn).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(b.checkOut).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-semibold">₹{b.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant={paymentBadge(b.paymentStatus)} className="capitalize">{b.paymentStatus}</Badge></TableCell>
                                    <TableCell><Badge variant={statusBadge(b.status)} className="capitalize">{b.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {isAdmin && b.status === 'confirmed' && (
                                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateMutation.mutate({ id: b._id, body: { status: 'checked-in' } })}>
                                                    <LogInIcon className="w-3 h-3 mr-1" />Check In
                                                </Button>
                                            )}
                                            {isAdmin && b.status === 'checked-in' && (
                                                <Button size="sm" variant="outline" className="text-blue-600" onClick={() => updateMutation.mutate({ id: b._id, body: { status: 'checked-out', paymentStatus: 'paid' } })}>
                                                    <LogOutIcon className="w-3 h-3 mr-1" />Check Out
                                                </Button>
                                            )}
                                            {isAdmin && b.paymentStatus === 'pending' && (
                                                <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => updateMutation.mutate({ id: b._id, body: { paymentStatus: 'paid' } })}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />Paid
                                                </Button>
                                            )}
                                            {(b.status === 'confirmed' || b.status === 'checked-in') && (
                                                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm('Cancel this booking?')) cancelMutation.mutate(b._id); }}>
                                                    <XCircle className="w-3 h-3 mr-1" />Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
