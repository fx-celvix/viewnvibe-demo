
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, User, Phone, ShoppingCart, IndianRupee, MapPin, Download, Search, ClipboardList, CheckCircle, XCircle, Trash2, Shield, Loader2, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { utils, writeFile } from 'xlsx';
import { collection, getDocs, onSnapshot, query, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { DatabasePageSkeleton } from '@/components/skeletons/DatabasePageSkeleton';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));
const CustomerExportModal = dynamic(() => import('@/components/CustomerExportModal').then(mod => mod.CustomerExportModal));


interface CustomerData {
    name: string;
    phone: string;
    address: string;
    totalOrders: number;
    totalSpent: number;
    email: string;
    lastPurchase: Timestamp;
}

interface OrderData {
    id: string;
    docId: string;
    customer: { name: string; phone: string; email?: string; };
    items: string;
    total: number;
    status: string;
    timestamp: Timestamp;
    address: string;
}

const PasskeyModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const [passkey, setPasskey] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPasskey('');
            setIsDeleting(false);
            setError('');
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        setIsDeleting(true);
        setError('');
        const success = await onConfirm(passkey);
        if (!success) {
            setError('Incorrect passkey. Data was not deleted.');
        }
        setIsDeleting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={onClose}><XCircle size={24} /></button>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-700">{message}</p>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="password"
                            value={passkey}
                            onChange={(e) => setPasskey(e.target.value)}
                            placeholder="Enter passkey"
                            className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                </div>
                <div className="p-4 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                    <button onClick={handleConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center justify-center w-28 disabled:opacity-50">
                        {isDeleting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">Please contact the administrator if you believe this is an error.</p>
    </div>
);


const DatabasePage = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [dataLoading, setDataLoading] = useState(true);
    const [customerData, setCustomerData] = useState<CustomerData[]>([]);
    const [allOrders, setAllOrders] = useState<OrderData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'customers' | 'orders'>('customers');
    const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<'orders' | 'customers' | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/dashboard/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            const ordersCollection = collection(db, 'orders');
            const q = query(ordersCollection, orderBy('timestamp', 'desc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedOrders = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as OrderData));
                setAllOrders(fetchedOrders);

                const customers: Record<string, CustomerData> = {};

                fetchedOrders.forEach(order => {
                    if (order.customer && order.customer.name && order.customer.phone) {
                        const customerId = order.customer.phone;
                        if (!customers[customerId]) {
                            customers[customerId] = {
                                name: order.customer.name,
                                phone: order.customer.phone,
                                address: order.address || 'N/A',
                                totalOrders: 0,
                                totalSpent: 0,
                                email: order.customer.email || 'N/A',
                                lastPurchase: new Timestamp(0, 0),
                            };
                        }

                        if (order.status === 'Delivered') {
                            customers[customerId].totalOrders += 1;
                            customers[customerId].totalSpent += order.total;
                            if (order.timestamp.toMillis() > customers[customerId].lastPurchase.toMillis()) {
                                customers[customerId].lastPurchase = order.timestamp;
                            }
                        }

                        if (order.address && order.address !== 'Take-away' && customers[customerId].address === 'N/A') {
                            customers[customerId].address = order.address;
                        }
                    }
                });

                const customerArray = Object.values(customers).sort((a, b) => b.totalSpent - a.totalSpent);
                setCustomerData(customerArray);
                setDataLoading(false);
            }, (error) => {
                console.error("Error fetching data:", error);
                setDataLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const handleLogout = () => {
        auth.signOut();
        router.push('/dashboard/login');
    };

    const filteredCustomerData = useMemo(() => {
        return customerData.filter(customer =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [customerData, searchQuery]);

    const filteredOrders = useMemo(() => {
        return allOrders.filter(order =>
            order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allOrders, searchQuery]);

    const handleExportCustomers = (filters) => {
        let filteredForExport = customerData;

        if (filters.lastPurchaseDate) {
            const filterDate = new Date(filters.lastPurchaseDate);
            if (filters.lastPurchaseCondition === 'lte') {
                filterDate.setHours(23, 59, 59, 999);
            } else {
                filterDate.setHours(0, 0, 0, 0);
            }
            const filterTimestamp = filterDate.getTime();

            filteredForExport = filteredForExport.filter(c => {
                const purchaseDate = c.lastPurchase.toDate().getTime();
                if (purchaseDate === new Timestamp(0, 0).toDate().getTime()) return false;
                return filters.lastPurchaseCondition === 'gte' ? purchaseDate >= filterTimestamp : purchaseDate <= filterTimestamp;
            });
        }

        if (filters.totalOrderValue) {
            const filterValue = Number(filters.totalOrderValue);
            filteredForExport = filteredForExport.filter(c => {
                return filters.totalOrderValueCondition === 'gte' ? c.totalSpent >= filterValue : c.totalSpent <= filterValue;
            });
        }

        if (filters.totalOrdersCount) {
            const filterCount = Number(filters.totalOrdersCount);
            filteredForExport = filteredForExport.filter(c => {
                return filters.totalOrdersCountCondition === 'gte' ? c.totalOrders >= filterCount : c.totalOrders <= filterCount;
            });
        }

        if (filteredForExport.length === 0) {
            alert("No customers found matching the specified criteria.");
            return;
        }

        const exportData = filteredForExport.map(c => ({
            'Name': c.name,
            'Email': c.email,
            'Phone': c.phone,
            'Total Spent (INR)': c.totalSpent.toFixed(2),
            'Total Orders': c.totalOrders,
            'Last Purchase Date': c.lastPurchase.toDate().toLocaleDateString()
        }));

        const worksheet = utils.json_to_sheet(exportData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Customers');
        writeFile(workbook, 'BiryaniCorner_Customers_Export.xlsx');
        setIsExportModalOpen(false);
    };

    const handleDeleteWithPasskey = async (passkey: string) => {
        const CORRECT_PASSKEY = '7979057085';
        if (passkey !== CORRECT_PASSKEY) {
            return false; // Indicates failure
        }

        try {
            const collectionName = deleteAction === 'orders' ? 'orders' : 'users'; // Assuming customer data is in 'users'
            const collectionRef = collection(db, collectionName);
            const querySnapshot = await getDocs(collectionRef);

            const batch = writeBatch(db);
            querySnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            setIsPasskeyModalOpen(false); // Close modal on success
            return true; // Indicates success
        } catch (error) {
            console.error("Error deleting all documents:", error);
            setIsPasskeyModalOpen(false); // Close modal on error too
            return false;
        }
    };

    const OrderStatusPill = ({ status }) => {
        const colors = {
            'Delivered': 'bg-green-100 text-green-800',
            'Declined': 'bg-red-100 text-red-800',
            'default': 'bg-blue-100 text-blue-800',
        };
        const colorClass = colors[status] || colors.default;

        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                {status}
            </span>
        );
    };

    const renderContent = () => {
        if (loading || dataLoading) {
            return <DatabasePageSkeleton />;
        }
        if (!user || user.email !== 'team.celvix@gmail.com') {
            return <AccessDenied />;
        }
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Database</h1>
                </div>

                <div className="flex border-b mb-6">
                    <button onClick={() => setActiveTab('customers')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'customers' ? 'border-b-2 border-senoa-green text-senoa-green' : 'text-gray-500'}`}>
                        All Customers
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'orders' ? 'border-b-2 border-senoa-green text-senoa-green' : 'text-gray-500'}`}>
                        All Orders
                    </button>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'customers' ? "Search by name or phone..." : "Search by ID, name, phone, items..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border rounded-md py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <button onClick={() => setIsExportModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteAction(activeTab);
                                    setIsPasskeyModalOpen(true);
                                }}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete All</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border">
                    {activeTab === 'customers' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Customer Name</th>
                                        <th scope="col" className="px-6 py-3">Phone Number</th>
                                        <th scope="col" className="px-6 py-3">Address</th>
                                        <th scope="col" className="px-6 py-3 text-center">Total Orders</th>
                                        <th scope="col" className="px-6 py-3 text-right">Total Spent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomerData.map((customer, index) => (
                                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                                    {customer.name}
                                                </div>
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                    {customer.phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className='truncate'>{customer.address || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <ShoppingCart className="h-4 w-4 mr-2 text-gray-400" />
                                                    {customer.totalOrders}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end font-semibold">
                                                    <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                                                    {customer.totalSpent.toFixed(2)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Order ID</th>
                                        <th scope="col" className="px-6 py-3">Customer</th>
                                        <th scope="col" className="px-6 py-3">Items</th>
                                        <th scope="col" className="px-6 py-3 text-center">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right">Total</th>
                                        <th scope="col" className="px-6 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.docId} className="bg-white border-b hover:bg-gray-50">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                #{order.id}
                                            </th>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold">{order.customer.name}</div>
                                                <div className="text-xs text-gray-500">{order.customer.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate">{order.items}</td>
                                            <td className="px-6 py-4 text-center">
                                                <OrderStatusPill status={order.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                ₹{order.total.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-gray-500">
                                                {order.timestamp?.toDate().toLocaleDateString()}
                                                <br />
                                                {order.timestamp?.toDate().toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <CustomerExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExportCustomers}
            />
            <PasskeyModal
                isOpen={isPasskeyModalOpen}
                onClose={() => setIsPasskeyModalOpen(false)}
                onConfirm={handleDeleteWithPasskey}
                title={`Delete All ${deleteAction === 'orders' ? 'Orders' : 'Customers'}`}
                message={`This action is irreversible and will permanently delete all ${deleteAction} from the database. Please enter the passkey to confirm.`}
            />

            {renderContent()}
        </div>
    );
};

export default DatabasePage;
