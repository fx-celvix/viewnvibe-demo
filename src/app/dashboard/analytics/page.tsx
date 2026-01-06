
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, BarChart3, TrendingUp, Package, IndianRupee, Clock, Users, RefreshCw, ShieldAlert, BarChart, LineChart, PieChart, Info, UserPlus, Trophy, Repeat, Map as MapIcon, Users2, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Line, Sector, AreaChart, Area, BarChart as RechartsBarChart } from 'recharts';
import { AnalyticsPageSkeleton } from '@/components/skeletons/AnalyticsPageSkeleton';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface OrderData {
    docId: string;
    id: string;
    customer: { name: string; phone: string; };
    items: string;
    total: number;
    status: string;
    timestamp: Timestamp;
    address: string;
    cart?: { name: string; quantity: number; price: number; }[];
    type: 'Delivery' | 'Take-away';
    location?: { latitude: number; longitude: number };
}


const CustomTooltip = ({ active, payload, label }: { active?: any, payload?: any, label?: any }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white border rounded-lg shadow-sm">
                <p className="font-bold">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {`${entry.name}: ${entry.name.includes('Sales') ? '₹' : ''}${entry.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">Please contact the administrator if you believe this is an error.</p>
    </div>
);

const NoDataAvailable = ({ message = "No data available for this view." }) => (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border">
        <div className="text-center p-4 text-sm text-muted-foreground">
            <Info className="mx-auto h-6 w-6 mb-2" />
            <p>{message}</p>
        </div>
    </div>
);

const HorizontalBarList = ({ data, dataKey, nameKey, title, unit, barColor = 'bg-senoa-green' }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border h-[400px]">
        <h3 className="font-bold mb-4">{title}</h3>
        {data && data.length > 0 ? (
            <div className="space-y-3 h-[90%] overflow-y-auto pr-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                        <div className="w-2/5 truncate pr-2 font-semibold">{item[nameKey]}</div>
                        <div className="w-3/5 flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                                <div
                                    className={`${barColor} h-4 rounded-full`}
                                    style={{ width: `${(item[dataKey] / data[0][dataKey]) * 100}%` }}
                                ></div>
                            </div>
                            <div className="w-16 text-right font-bold">{unit === 'currency' ? '₹' : ''}{item[dataKey].toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <NoDataAvailable />
        )}
    </div>
);

const SalesByProductChart = ({ data, title }) => {
    const COLORS = [
        '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
        '#f97316', '#eab308', '#ef4444', '#22c55e', '#a855f7'
    ];

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm border h-[400px]">
                <h3 className="font-bold mb-4">{title}</h3>
                <NoDataAvailable />
            </div>
        );
    }

    const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
    const topItems = data.slice(0, 5);
    const otherItemsCount = data.length - topItems.length;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border h-[400px] flex flex-col">
            <h3 className="font-bold mb-4">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 flex-grow">
                {topItems.map((item, index) => (
                    <div key={item.name}>
                        <div className="flex items-center text-sm mb-1">
                            <span className="w-2 h-2 rounded-sm mr-2 flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span className="text-muted-foreground truncate">{item.name}</span>
                        </div>
                        <p className="font-bold text-lg">₹{item.sales.toLocaleString()}</p>
                    </div>
                ))}
                {otherItemsCount > 0 && (
                    <div>
                        <div className="flex items-center text-sm mb-1">
                            <span className="w-2 h-2 rounded-sm mr-2 bg-gray-300"></span>
                            <span className="text-muted-foreground">Other</span>
                        </div>
                        <p className="font-bold text-lg">+{otherItemsCount} more</p>
                    </div>
                )}
            </div>
            <div className="flex w-full h-3 rounded-full overflow-hidden mt-auto">
                {data.map((item, index) => (
                    <div
                        key={item.name}
                        className="h-full"
                        style={{
                            width: `${(item.sales / totalSales) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                        }}
                        title={`${item.name}: ₹${item.sales.toLocaleString()}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};


const AnalyticsPage = () => {
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const [dataLoading, setDataLoading] = useState(true);
    const [allOrders, setAllOrders] = useState<OrderData[]>([]);
    const [selectedRange, setSelectedRange] = useState('This Month');

    const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
    const [historicalCustomerData, setHistoricalCustomerData] = useState(new Set());
    const [metrics, setMetrics] = useState({ totalSales: 0, totalOrders: 0, avgOrderValue: 0, newCustomers: 0, newCustomerSales: { count: 0, total: 0 }, repeatedCustomerSales: { count: 0, total: 0 }, canceledOrders: { count: 0, total: 0, percentage: 0 } });

    const [salesOverTimeData, setSalesOverTimeData] = useState([]);
    const [salesByHourData, setSalesByHourData] = useState([]);
    const [popularItemsData, setPopularItemsData] = useState([]);
    const [salesByProductData, setSalesByProductData] = useState([]);
    const [topCustomersByValue, setTopCustomersByValue] = useState([]);
    const [topCustomersByOrders, setTopCustomersByOrders] = useState([]);
    const [customerTrendsData, setCustomerTrendsData] = useState([]);


    // State for map icon
    const [L, setL] = useState(null);

    useEffect(() => {
        // Dynamically import leaflet on the client side
        import('leaflet').then(leaflet => {
            setL(leaflet);
        });
    }, []);

    const mapIcon = useMemo(() => {
        if (!L) return null;
        return new L.Icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.webp',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.webp',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.webp',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }, [L]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/dashboard/login');
        } else if (user) {
            const ordersCollection = collection(db, 'orders');
            const q = query(ordersCollection, orderBy('timestamp', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedOrders = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id } as OrderData));
                setAllOrders(fetchedOrders);
                setDataLoading(false);
            }, (error) => {
                console.error("Error fetching data:", error);
                setDataLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user, authLoading, router]);

    const handleLogout = () => {
        auth.signOut();
        router.push('/dashboard/login');
    };

    useEffect(() => {
        if (!allOrders.length) return;

        const now = new Date();
        const historicalCustomers = new Set<string>();

        const filtered = allOrders.filter(order => {
            if (!order.timestamp || !order.customer?.phone) return false;
            const orderDate = order.timestamp.toDate();
            if (isNaN(orderDate.getTime())) return false;

            let isInRange = false;

            switch (selectedRange) {
                case 'Today': isInRange = orderDate.toDateString() === now.toDateString(); break;
                case 'Yesterday': {
                    const yesterday = new Date(now);
                    yesterday.setDate(now.getDate() - 1);
                    isInRange = orderDate.toDateString() === yesterday.toDateString();
                    break;
                }
                case 'Last 7 Days': {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    isInRange = orderDate >= sevenDaysAgo;
                    break;
                }
                case 'This Month': isInRange = orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth(); break;
                case 'Last 30 Days': {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    isInRange = orderDate >= thirtyDaysAgo;
                    break;
                }
                case 'This Year': isInRange = orderDate.getFullYear() === now.getFullYear(); break;
                case 'All Time': isInRange = true; break;
                default: isInRange = true;
            }

            if (!isInRange) {
                historicalCustomers.add(order.customer.phone);
            }

            return isInRange;
        });

        setFilteredOrders(filtered);
        setHistoricalCustomerData(historicalCustomers);
    }, [allOrders, selectedRange]);

    useEffect(() => {
        if (!filteredOrders) return;

        const deliveredOrders = filteredOrders.filter(o => o.status === 'Delivered');
        const totalSales = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = deliveredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        const newCustomerSales = { total: 0, count: 0 };
        const repeatedCustomerSales = { total: 0, count: 0 };
        const canceledOrders = { total: 0, count: 0, percentage: 0 };

        const customersInPeriod = new Map<string, 'new' | 'repeat'>();

        deliveredOrders.forEach(o => {
            const phone = o.customer.phone;
            if (!customersInPeriod.has(phone)) {
                if (historicalCustomerData.has(phone)) {
                    customersInPeriod.set(phone, 'repeat');
                } else {
                    customersInPeriod.set(phone, 'new');
                }
            }
        });

        deliveredOrders.forEach(o => {
            const phone = o.customer.phone;
            const customerType = customersInPeriod.get(phone);

            if (customerType === 'new') {
                newCustomerSales.total += o.total;
            } else if (customerType === 'repeat') {
                repeatedCustomerSales.total += o.total;
            }
        });

        filteredOrders.forEach(o => {
            if (o.status === 'Declined') {
                canceledOrders.count += 1;
                canceledOrders.total += o.total;
            }
        });

        if (filteredOrders.length > 0) {
            canceledOrders.percentage = (canceledOrders.count / filteredOrders.length) * 100;
        }

        customersInPeriod.forEach((type) => {
            if (type === 'new') {
                newCustomerSales.count++;
            } else if (type === 'repeat') {
                repeatedCustomerSales.count++;
            }
        });

        setMetrics({
            totalSales,
            totalOrders,
            avgOrderValue,
            newCustomers: newCustomerSales.count,
            newCustomerSales,
            repeatedCustomerSales,
            canceledOrders
        });

        // Sales over time
        const salesMap = new Map<string, { sales: number; orders: number }>();
        deliveredOrders.forEach(order => {
            const date = order.timestamp.toDate();
            let key;
            if (['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'].includes(selectedRange)) {
                key = date.toLocaleDateString('en-CA');
            } else if (['This Month', 'This Year', 'All Time'].includes(selectedRange)) {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                key = date.toLocaleDateString('en-CA');
            }
            if (!salesMap.has(key)) salesMap.set(key, { sales: 0, orders: 0 });
            const current = salesMap.get(key);
            current.sales += order.total;
            current.orders += 1;
        });
        const sortedSalesData = Array.from(salesMap.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setSalesOverTimeData(sortedSalesData.map(d => ({
            ...d,
            date: new Date(d.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
        })));

        // Sales by hour
        const hourlySales = new Array(24).fill(0).map((_, i) => ({ hour: i, sales: 0 }));
        deliveredOrders.forEach(order => {
            const hour = order.timestamp.toDate().getHours();
            hourlySales[hour].sales += order.total;
        });
        setSalesByHourData(hourlySales
            .map(d => ({ ...d, hour: `${d.hour % 12 === 0 ? 12 : d.hour % 12}${d.hour < 12 ? 'am' : 'pm'}` }))
            .filter(d => d.sales > 0));

        // Popular Items
        const itemCounts = new Map<string, number>();
        filteredOrders.forEach(order => {
            if (order.cart) {
                order.cart.forEach(item => {
                    const name = item.name.replace(/\s*\([^)]*\)$/, '');
                    itemCounts.set(name, (itemCounts.get(name) || 0) + item.quantity);
                });
            }
        });
        setPopularItemsData(Array.from(itemCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10));

        // Sales by product
        const itemSales = new Map<string, number>();
        deliveredOrders.forEach(order => {
            if (order.cart) {
                order.cart.forEach(item => {
                    const name = item.name.replace(/\s*\([^)]*\)$/, '');
                    itemSales.set(name, (itemSales.get(name) || 0) + (item.price * item.quantity));
                });
            }
        });
        setSalesByProductData(Array.from(itemSales.entries())
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10));

        // Top customers by value
        const customerSpending = new Map<string, { name: string; total: number }>();
        deliveredOrders.forEach(order => {
            const phone = order.customer.phone;
            if (!customerSpending.has(phone)) customerSpending.set(phone, { name: order.customer.name, total: 0 });
            customerSpending.get(phone).total += order.total;
        });
        setTopCustomersByValue(Array.from(customerSpending.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 10));

        // Top customers by orders
        const customerOrders = new Map<string, { name: string; count: number }>();
        deliveredOrders.forEach(order => {
            const phone = order.customer.phone;
            if (!customerOrders.has(phone)) customerOrders.set(phone, { name: order.customer.name, count: 0 });
            customerOrders.get(phone).count += 1;
        });
        setTopCustomersByOrders(Array.from(customerOrders.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10));

        // Customer Trends
        const trendsMap = new Map<string, { firstTime: Set<string>, recurring: Set<string> }>();
        const customersSeenInPeriod = new Set<string>();
        const sortedOrders = [...filteredOrders].sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
        sortedOrders.forEach(order => {
            const date = order.timestamp.toDate();
            const phone = order.customer.phone;
            let key;
            if (['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'].includes(selectedRange)) {
                key = date.toLocaleDateString('en-CA');
            } else {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            if (!trendsMap.has(key)) trendsMap.set(key, { firstTime: new Set(), recurring: new Set() });
            if (!customersSeenInPeriod.has(phone)) {
                if (historicalCustomerData.has(phone)) {
                    trendsMap.get(key).recurring.add(phone);
                } else {
                    trendsMap.get(key).firstTime.add(phone);
                }
                customersSeenInPeriod.add(phone);
            } else {
                trendsMap.get(key).recurring.add(phone);
            }
        });
        setCustomerTrendsData(Array.from(trendsMap.entries()).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
            'First time': data.firstTime.size,
            'Recurring': data.recurring.size,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

    }, [filteredOrders, historicalCustomerData, selectedRange]);


    const customerLocations = useMemo(() => {
        return filteredOrders
            .filter(order => order.location && order.location.latitude && order.location.longitude)
            .map(order => ({
                lat: order.location.latitude,
                lng: order.location.longitude,
                customer: order.customer.name,
                orderId: order.id,
            }));
    }, [filteredOrders]);

    const renderContent = () => {
        if (authLoading || dataLoading) {
            return <AnalyticsPageSkeleton />;
        }
        if (!user || user.email !== 'team.celvix@gmail.com') {
            return <AccessDenied />;
        }
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl pb-16">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value)}
                        className="text-sm border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                    >
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                        <option>All Time</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm text-muted-foreground flex items-center"><IndianRupee className="h-4 w-4 mr-1" />Total Sales</h3>
                        <p className="text-2xl font-bold">₹<AnimatedCounter endValue={metrics.totalSales} /></p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm text-muted-foreground flex items-center"><Package className="h-4 w-4 mr-1" />Delivered Orders</h3>
                        <p className="text-2xl font-bold"><AnimatedCounter endValue={metrics.totalOrders} /></p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm text-muted-foreground flex items-center"><TrendingUp className="h-4 w-4 mr-1" />Avg. Order Value</h3>
                        <p className="text-2xl font-bold">₹<AnimatedCounter endValue={metrics.avgOrderValue} /></p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm text-muted-foreground flex items-center"><UserPlus className="h-4 w-4 mr-1" />New Customers</h3>
                        <p className="text-2xl font-bold"><AnimatedCounter endValue={metrics.newCustomers} /></p>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border h-[400px]">
                        <h3 className="font-bold mb-4">Customers Over Time</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            {customerTrendsData && customerTrendsData.length > 0 ? (
                                <AreaChart data={customerTrendsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip content={CustomTooltip} />
                                    <Legend />
                                    <Area type="monotone" dataKey="First time" stroke="#3b82f6" fill="#bfdbfe" />
                                    <Area type="monotone" dataKey="Recurring" stroke="#8b5cf6" fill="#ddd6fe" />
                                </AreaChart>
                            ) : <NoDataAvailable />}
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border h-[400px]">
                        <h3 className="font-bold mb-4">Sales Over Time</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            {salesOverTimeData && salesOverTimeData.length > 0 ? (
                                <ComposedChart data={salesOverTimeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis yAxisId="left" label={{ value: 'Sales (₹)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 12 }} fontSize={12} />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Orders', angle: -90, position: 'insideRight', offset: 5, fontSize: 12 }} fontSize={12} />
                                    <Tooltip content={CustomTooltip} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="sales" name="Sales (₹)" fill="#82ca9d" barSize={20} />
                                    <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#ff7300" />
                                </ComposedChart>
                            ) : <NoDataAvailable />}
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="text-sm font-semibold flex items-center mb-2"><UserPlus className="h-4 w-4 mr-2 text-blue-600" />New Customers</h3>
                            <p className="text-xl font-bold">{metrics.newCustomerSales.count}</p>
                            <p className="text-sm text-muted-foreground">Total Sales: <span className="font-bold text-senoa-green">₹{metrics.newCustomerSales.total.toLocaleString()}</span></p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="text-sm font-semibold flex items-center mb-2"><Users2 className="h-4 w-4 mr-2 text-purple-600" />Repeated Customers</h3>
                            <p className="text-xl font-bold">{metrics.repeatedCustomerSales.count}</p>
                            <p className="text-sm text-muted-foreground">Total Sales: <span className="font-bold text-senoa-green">₹{metrics.repeatedCustomerSales.total.toLocaleString()}</span></p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border">
                            <h3 className="text-sm font-semibold flex items-center mb-2"><XCircle className="h-4 w-4 mr-2 text-red-600" />Canceled Orders</h3>
                            <p className="text-xl font-bold">{metrics.canceledOrders.count} <span className="text-base text-muted-foreground">({metrics.canceledOrders.percentage.toFixed(1)}%)</span></p>
                            <p className="text-sm text-muted-foreground">Total Value: <span className="font-bold text-red-600">₹{metrics.canceledOrders.total.toLocaleString()}</span></p>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <HorizontalBarList
                        data={popularItemsData}
                        dataKey="count"
                        nameKey="name"
                        title="Most Popular Items (by Quantity)"
                        unit="count"
                        barColor="bg-blue-500"
                    />
                    <HorizontalBarList
                        data={topCustomersByValue}
                        dataKey="total"
                        nameKey="name"
                        title="Top Customers by Value"
                        unit="currency"
                        barColor="bg-senoa-green"
                    />
                    <HorizontalBarList
                        data={topCustomersByOrders}
                        dataKey="count"
                        nameKey="name"
                        title="Top Customers by Order Count"
                        unit="count"
                        barColor="bg-orange-500"
                    />
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border h-[400px]">
                        <h3 className="font-bold mb-4">Sales by Hour</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            {salesByHourData && salesByHourData.length > 0 ? (
                                <RechartsBarChart data={salesByHourData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" fontSize={12} />
                                    <YAxis fontSize={12} />
                                    <Tooltip content={CustomTooltip} />
                                    <Legend />
                                    <Bar dataKey="sales" name="Sales (₹)" fill="#8884d8" />
                                </RechartsBarChart>
                            ) : (
                                <NoDataAvailable />
                            )}
                        </ResponsiveContainer>
                    </div>
                    <SalesByProductChart
                        data={salesByProductData}
                        title="Top Selling Items (by Sales)"
                    />
                </div>

                {/* Row 4 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border h-[500px]">
                    <h3 className="font-bold mb-4 flex items-center"><MapIcon className="h-5 w-5 mr-2" />Customer Reach Map</h3>
                    {customerLocations.length > 0 && mapIcon ? (
                        <MapContainer center={[25.58055, 85.08372]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.webp"
                            />
                            {customerLocations.map((loc, index) => (
                                <Marker key={index} position={[loc.lat, loc.lng]} icon={mapIcon}>
                                    <Popup>
                                        <b>{loc.customer}</b><br />Order #{loc.orderId}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <NoDataAvailable message="No location data available for the selected period." />
                    )}
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {renderContent()}
        </div>
    );
};


export default AnalyticsPage;
