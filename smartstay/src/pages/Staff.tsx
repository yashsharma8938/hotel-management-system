import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react';

interface Staff {
    _id: string; name: string; email: string; phone: string; role: string;
    department: string; shift: string; salary: number; joinDate: string; status: string;
}

const statusBadge = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'destructive'> = { active: 'success', 'on-leave': 'warning', inactive: 'destructive' };
    return map[s] || 'default';
};

const emptyStaff = { name: '', email: '', phone: '', role: '', department: 'front-desk', shift: 'morning', salary: 20000, status: 'active' };

export default function StaffPage() {
    const { token } = useAuth();
    const qc = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Staff | null>(null);
    const [form, setForm] = useState(emptyStaff);

    const { data: staff = [], isLoading } = useQuery<Staff[]>({
        queryKey: ['staff'],
        queryFn: () => api('/staff', { token }),
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof form) => api('/staff', { method: 'POST', token, body: data }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); setDialogOpen(false); },
    });

    const updateMutation = useMutation({
        mutationFn: (data: typeof form & { _id: string }) => api(`/staff/${data._id}`, { method: 'PUT', token, body: data }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); setDialogOpen(false); setEditing(null); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api(`/staff/${id}`, { method: 'DELETE', token }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
    });

    const openCreate = () => { setEditing(null); setForm(emptyStaff); setDialogOpen(true); };
    const openEdit = (s: Staff) => { setEditing(s); setForm({ name: s.name, email: s.email, phone: s.phone, role: s.role, department: s.department, shift: s.shift, salary: s.salary, status: s.status }); setDialogOpen(true); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) updateMutation.mutate({ ...form, _id: editing._id });
        else createMutation.mutate(form);
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
                    <p className="text-muted-foreground mt-1">Manage hotel staff members</p>
                </div>
                <Button onClick={openCreate} className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> Add Staff
                </Button>
            </div>

            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    <UserCog className="w-8 h-8 mx-auto mb-2 opacity-50" />No staff members yet
                                </TableCell></TableRow>
                            ) : staff.map(s => (
                                <TableRow key={s._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">{s.name.charAt(0)}</div>
                                            <div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.email}</div></div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{s.role}</TableCell>
                                    <TableCell className="capitalize">{s.department.replace('-', ' ')}</TableCell>
                                    <TableCell className="capitalize">{s.shift}</TableCell>
                                    <TableCell>₹{s.salary.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant={statusBadge(s.status)} className="capitalize">{s.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm('Delete this staff member?')) deleteMutation.mutate(s._id); }}><Trash2 className="w-4 h-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
                        <DialogDescription>Fill in the staff details</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Phone</Label><Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Role/Position</Label><Input required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="e.g. Receptionist" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Select value={form.department} onValueChange={v => setForm({ ...form, department: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="front-desk">Front Desk</SelectItem>
                                        <SelectItem value="housekeeping">Housekeeping</SelectItem>
                                        <SelectItem value="kitchen">Kitchen</SelectItem>
                                        <SelectItem value="management">Management</SelectItem>
                                        <SelectItem value="security">Security</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Shift</Label>
                                <Select value={form.shift} onValueChange={v => setForm({ ...form, shift: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="morning">Morning</SelectItem>
                                        <SelectItem value="afternoon">Afternoon</SelectItem>
                                        <SelectItem value="night">Night</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Salary (₹)</Label><Input type="number" required value={form.salary} onChange={e => setForm({ ...form, salary: Number(e.target.value) })} /></div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on-leave">On Leave</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update' : 'Add Staff'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
