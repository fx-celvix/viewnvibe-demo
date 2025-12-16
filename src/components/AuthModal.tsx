
'use client';

import { useState } from 'react';
import { auth, db, googleProvider, signInWithPopup } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { X, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
    uid: string;
    name: string;
    email: string;
    addresses?: any[];
}

const GoogleIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.631,44,29.5,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [authActionLoading, setAuthActionLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setError('');
        setSuccessMessage('');
    };

    const handleClose = () => {
        resetForm();
        setAuthView('login');
        onClose();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setAuthActionLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            handleClose();
        } catch (err) {
            setError('Invalid email or password.');
            console.error(err);
        } finally {
            setAuthActionLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError('');
        setSuccessMessage('');
        setAuthActionLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                const newUserData: UserData = {
                    uid: user.uid,
                    name: user.displayName || 'Google User',
                    email: user.email || '',
                    addresses: [],
                };
                await setDoc(userDocRef, newUserData);
            }
            handleClose();
        } catch (error) {
            setError('Failed to sign in with Google. Please try again.');
            console.error(error);
        } finally {
            setAuthActionLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setAuthActionLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            
            const newUserData: UserData = {
                uid: userCredential.user.uid,
                name: name,
                email: email,
                addresses: [],
            };
            
            await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
            handleClose();
        } catch (err) {
            if ((err as any).code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else {
                setError('Failed to create an account. Please try again.');
            }
            console.error(err);
        } finally {
            setAuthActionLoading(false);
        }
    };
    
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setAuthActionLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage('Password reset email sent! Check your inbox.');
        } catch (err) {
            setError('Could not send password reset email. Please check the address.');
            console.error(err);
        } finally {
            setAuthActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="relative bg-white p-6 rounded-lg shadow-sm w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20}/>
                </button>
                {authView === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Login</h3>
                            <p className="text-xs text-muted-foreground">Welcome back!</p>
                        </div>
                        <div>
                            <label className="sr-only">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                            <div className="text-right mt-1">
                                <button type="button" onClick={() => { setAuthView('forgotPassword'); resetForm(); }} className="text-xs font-semibold text-senoa-green hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button type="submit" disabled={authActionLoading} className="w-full bg-senoa-green text-white font-bold py-2 px-4 rounded-md hover:bg-senoa-green-dark transition disabled:opacity-50">
                            {authActionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : 'LOGIN'}
                        </button>
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-2 text-xs text-gray-400">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>
                        <button type="button" onClick={handleGoogleSignIn} disabled={authActionLoading} className="w-full bg-white text-gray-700 font-semibold py-2 px-4 rounded-md border hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center space-x-2">
                            <GoogleIcon />
                            <span>Continue with Google</span>
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <button type="button" onClick={() => { setAuthView('signup'); resetForm(); }} className="font-semibold text-senoa-green">Sign Up</button>
                        </p>
                    </form>
                )}
                {authView === 'signup' && (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Sign Up</h3>
                            <p className="text-xs text-muted-foreground">Create your account.</p>
                        </div>
                        <div>
                            <label className="sr-only">Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="sr-only">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="sr-only">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        <button type="submit" disabled={authActionLoading} className="w-full bg-senoa-green text-white font-bold py-2 px-4 rounded-md hover:bg-senoa-green-dark transition disabled:opacity-50">
                            {authActionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : 'SIGN UP'}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Already have an account?{' '}
                            <button type="button" onClick={() => { setAuthView('login'); resetForm(); }} className="font-semibold text-senoa-green">Login</button>
                        </p>
                    </form>
                )}
                {authView === 'forgotPassword' && (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Reset Password</h3>
                            <p className="text-xs text-muted-foreground">Enter your email to get a reset link.</p>
                        </div>
                        <div>
                            <label className="sr-only">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                        {successMessage && <p className="text-senoa-green text-xs text-center">{successMessage}</p>}
                        <button type="submit" disabled={authActionLoading} className="w-full bg-senoa-green text-white font-bold py-2 px-4 rounded-md hover:bg-senoa-green-dark transition disabled:opacity-50">
                            {authActionLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto"/> : 'SEND RESET LINK'}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            Remembered your password?{' '}
                            <button type="button" onClick={() => { setAuthView('login'); resetForm(); }} className="font-semibold text-senoa-green">Login</button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};
