import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { BedDouble, Wifi, Tv, Wind, Wine, Bath, Star, Users, Calendar } from 'lucide-react';

interface Room {
    _id: string; number: string; type: string; price: number; status: string;
    floor: number; capacity: number; amenities: string[]; description: string;
}

const amenityIcon = (a: string) => {
    const lower = a.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('tv')) return <Tv className="w-3 h-3" />;
    if (lower.includes('ac')) return <Wind className="w-3 h-3" />;
    if (lower.includes('bar')) return <Wine className="w-3 h-3" />;
    if (lower.includes('bath') || lower.includes('jacuzzi')) return <Bath className="w-3 h-3" />;
    return <Star className="w-3 h-3" />;
};

const typeGradient = (t: string) => {
    const map: Record<string, string> = {
        single: 'from-blue-500 to-cyan-400',
        double: 'from-violet-500 to-purple-400',
        suite: 'from-amber-500 to-orange-400',
        deluxe: 'from-rose-500 to-pink-400'
    };
    return map[t] || 'from-gray-500 to-gray-400';
};

export default function CustomerRooms() {
    const { token } = useAuth();
    const qc = useQueryClient();
    const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
    const [bookingForm, setBookingForm] = useState({ checkIn: '', checkOut: '', guests: 1 });
    const [error, setError] = useState('');

    const { data: rooms = [], isLoading } = useQuery<Room[]>({
        queryKey: ['rooms'],
        queryFn: () => api('/rooms'),
    });

    const bookMutation = useMutation({
        mutationFn: (data: { room: string; checkIn: string; checkOut: string; guests: number }) =>
            api('/bookings', { method: 'POST', token, body: data }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['rooms'] });
            qc.invalidateQueries({ queryKey: ['bookings'] });
            setBookingRoom(null);
            setError('');
        },
        onError: (err: Error) => setError(err.message),
    });

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingRoom) return;
        setError('');
        bookMutation.mutate({ room: bookingRoom._id, checkIn: bookingForm.checkIn, checkOut: bookingForm.checkOut, guests: bookingForm.guests });
    };

    const availableRooms = rooms.filter(r => r.status === 'available');

    if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Browse Rooms</h1>
                <p className="text-muted-foreground mt-1">Find and book your perfect room</p>
            </div>

            <div className="flex gap-2 flex-wrap">
                <Badge variant="success" className="text-sm">{availableRooms.length} rooms available</Badge>
            </div>

            {availableRooms.length === 0 ? (
                <Card className="border-0 shadow-md">
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <BedDouble className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No rooms available at the moment</p>
                        <p className="text-sm">Please check back later</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableRooms.map(room => (
                        <Card key={room._id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
                            <div className={`h-32 bg-gradient-to-r ${typeGradient(room.type)} flex items-center justify-center relative overflow-hidden`}>
                                <BedDouble className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform" />
                                <div className="absolute top-3 right-3">
                                    <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm capitalize">{room.type}</Badge>
                                </div>
                                <div className="absolute bottom-3 left-3">
                                    <span className="text-white font-bold text-2xl">Room {room.number}</span>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">₹{room.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/night</span></CardTitle>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />{room.capacity}
                                    </div>
                                </div>
                                <CardDescription>Floor {room.floor} • {room.description || 'Comfortable hotel room'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-1.5">
                                    {room.amenities.map(a => (
                                        <span key={a} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                            {amenityIcon(a)}{a}
                                        </span>
                                    ))}
                                </div>
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg" onClick={() => { setBookingRoom(room); setBookingForm({ checkIn: '', checkOut: '', guests: 1 }); setError(''); }}>
                                    <Calendar className="w-4 h-4 mr-2" />Book Now
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Booking Dialog */}
            <Dialog open={!!bookingRoom} onOpenChange={() => setBookingRoom(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Book Room {bookingRoom?.number}</DialogTitle>
                        <DialogDescription>
                            {bookingRoom?.type.charAt(0).toUpperCase()}{bookingRoom?.type.slice(1)} Room • ₹{bookingRoom?.price.toLocaleString()}/night
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBook} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Check In</Label>
                                <Input type="date" required value={bookingForm.checkIn}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setBookingForm({ ...bookingForm, checkIn: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Check Out</Label>
                                <Input type="date" required value={bookingForm.checkOut}
                                    min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                                    onChange={e => setBookingForm({ ...bookingForm, checkOut: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Guests</Label>
                            <Input type="number" min={1} max={bookingRoom?.capacity || 4} required value={bookingForm.guests}
                                onChange={e => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })} />
                        </div>

                        {bookingForm.checkIn && bookingForm.checkOut && (
                            <div className="p-3 rounded-lg bg-muted">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {Math.ceil((new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights × ₹{bookingRoom?.price.toLocaleString()}
                                    </span>
                                    <span className="font-bold">
                                        ₹{(Math.ceil((new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)) * (bookingRoom?.price || 0)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setBookingRoom(null)}>Cancel</Button>
                            <Button type="submit" disabled={bookMutation.isPending}>
                                {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
