'use client';

import { login } from '@/lib/auth';
import { Users, Lock, User } from 'lucide-react';
import { useState } from 'react';

export default function LoginPage() {
    const [error, setError] = useState('');

    const handleSubmit = async (formData: FormData) => {
        const res = await login(formData); // This will redirect on success
        if (res?.error) {
            setError(res.error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8 shadow-lg">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <Users size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">Anavrin Sarees</h1>
                    <p className="text-muted-foreground">Sign in to continue</p>
                </div>

                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <select
                                name="username"
                                id="username"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">Select user</option>
                                <option value="Putty">Putty</option>
                                <option value="Sony">Sony</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <input
                                name="password"
                                id="password"
                                type="password"
                                required
                                placeholder="Enter your password"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>

                    <button type="submit" className="w-full h-10 inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
