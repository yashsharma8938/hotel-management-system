import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface Guest {
    _id: string; name: string; email: string; phone: string; role: string; address: string; createdAt: string;
}

export default function Guests() {
    const { token } = useAuth();
    const { data: guests = [], isLoading } = useQuery<Guest[]>({
        queryKey: ['guests'],
        queryFn: () => api('/auth/customers', { token }),
    });

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
                <p className="text-muted-foreground mt-1">Registered hotel guests</p>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Registered</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {guests.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />No guests registered yet
                                </TableCell></TableRow>
                            ) : guests.map(g => (
                                <TableRow key={g._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{g.name.charAt(0)}</div>
                                            {g.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{g.email}</TableCell>
                                    <TableCell>{g.phone || '—'}</TableCell>
                                    <TableCell>{g.address || '—'}</TableCell>
                                    <TableCell>{new Date(g.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
