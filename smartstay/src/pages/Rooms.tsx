import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, BedDouble } from 'lucide-react';

interface Room {
    _id: string; number: string; type: string; price: number; status: string;
    floor: number; capacity: number; amenities: string[]; description: string;
}

const statusBadge = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
        available: 'success', occupied: 'warning', maintenance: 'destructive', reserved: 'default'
    };
    return map[s] || 'default';
};

const emptyRoom = { number: '', type: 'single', price: 2500, floor: 1, capacity: 1, amenities: 'WiFi, AC, TV', description: '', status: 'available' };

export default function Rooms() {
    const { token } = useAuth();
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Room | null>(null);
    const [form, setForm] = useState(emptyRoom);

    const { data: rooms = [], isLoading } = useQuery<Room[]>({
        queryKey: ['rooms'],
        queryFn: () => api('/rooms', { token }),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => api('/rooms', { method: 'POST', token, body: { ...data, amenities: data.amenities.split(',').map(a => a.trim()) } }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); setDialogOpen(false); },
    });

    const updateMutation = useMutation({
        mutationFn: (data: typeof form & { _id: string }) => api(`/rooms/${data._id}`, { method: 'PUT', token, body: { ...data, amenities: data.amenities.split(',').map(a => a.trim()) } }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); setDialogOpen(false); setEditing(null); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api(`/rooms/${id}`, { method: 'DELETE', token }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
    });

    const openCreate = () => { setEditing(null); setForm(emptyRoom); setDialogOpen(true); };
    const openEdit = (r: Room) => { setEditing(r); setForm({ ...r, amenities: r.amenities.join(', ') }); setDialogOpen(true); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) updateMutation.mutate({ ...form, _id: editing._id });
        else createMutation.mutate(form);
    };

    const filtered = rooms.filter(r =>
        r.number.toLowerCase().includes(search.toLowerCase()) ||
        r.type.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
                    <p className="text-muted-foreground mt-1">Manage your hotel rooms</p>
                </div>
                <Button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> Add Room
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search rooms..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <div className="flex gap-2">
                    {['all', 'available', 'occupied', 'maintenance'].map(s => (
                        <Badge key={s} variant={search === s ? 'default' : 'outline'} className="cursor-pointer capitalize"
                            onClick={() => setSearch(s === 'all' ? '' : s)}>{s}</Badge>
                    ))}
                </div>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Room</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead>Price/Night</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amenities</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    <BedDouble className="w-8 h-8 mx-auto mb-2 opacity-50" />No rooms found
                                </TableCell></TableRow>
                            ) : filtered.map((r) => (
                                <TableRow key={r._id}>
                                    <TableCell className="font-bold text-lg">{r.number}</TableCell>
                                    <TableCell className="capitalize">{r.type}</TableCell>
                                    <TableCell>{r.floor}</TableCell>
                                    <TableCell>₹{r.price.toLocaleString()}</TableCell>
                                    <TableCell>{r.capacity}</TableCell>
                                    <TableCell><Badge variant={statusBadge(r.status)} className="capitalize">{r.status}</Badge></TableCell>
                                    <TableCell className="max-w-[200px]"><span className="text-xs text-muted-foreground">{r.amenities.join(', ')}</span></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm('Delete this room?')) deleteMutation.mutate(r._id); }}><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                        <DialogDescription>{editing ? 'Update room details' : 'Fill in the room details'}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Room Number</Label>
                                <Input required value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="double">Double</SelectItem>
                                        <SelectItem value="suite">Suite</SelectItem>
                                        <SelectItem value="deluxe">Deluxe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input type="number" required value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Floor</Label>
                                <Input type="number" required value={form.floor} onChange={e => setForm({ ...form, floor: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacity</Label>
                                <Input type="number" required value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="occupied">Occupied</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amenities (comma separated)</Label>
                            <Input value={form.amenities} onChange={e => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, AC, TV, Mini Bar" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {editing ? 'Update Room' : 'Create Room'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
