
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, ShieldAlert, Send, Loader2, CheckCircle, Settings, X, Save, Type, FileText, Users, TrendingUp, Download, IndianRupee, Hash, Calendar, Info, BarChart3, Lightbulb, Target, MessageCircle, BarChartHorizontal, Megaphone, Mail, ChevronLeft, ChevronRight, Award, CreditCard, Truck, QrCode, Tag, MessageSquare as FeedbackIcon, MessageCircle as WhatsAppIcon, Plus, UserPlus, ClipboardList, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { sendPromotionalEmail } from '@/ai/flows/send-email-flow';
import { doc, getDoc, setDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { MarketingPageSkeleton } from '@/components/skeletons/MarketingPageSkeleton';
import { utils, writeFile } from 'xlsx';
import dynamic from 'next/dynamic';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));
const CustomerExportModal = dynamic(() => import('@/components/CustomerExportModal').then(mod => mod.CustomerExportModal));


const ApiSettingsModal = ({ isOpen, onClose, apiKey, setApiKey, onSave, isSaving }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">API Key Settings</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-gray-700">
                        Enter your SendGrid API key here. This key will be stored securely and used to send emails on your behalf.
                        You can get your free key from the <a href="https://signup.sendgrid.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SendGrid website</a>.
                    </p>
                    <div className="relative">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your SendGrid API Key"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>
                <div className="p-4 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100 disabled:opacity-50">Cancel</button>
                    <button onClick={onSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold rounded-md bg-senoa-green text-white hover:bg-senoa-green-dark flex items-center justify-center w-28 disabled:opacity-50">
                        {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Key'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-muted-foreground text-sm mt-2">You do not have permission to view this page.</p>
    </div>
);


const growthHacks = [
    {
        title: 'Welcome Campaign',
        content: 'Thank them for visiting / ordering → Share a 10% off coupon for the next order.',
        why: 'Encourages repeat business right from the first interaction.',
        imageUrl: 'https://i.pinimg.com/736x/ce/d9/bd/ced9bda12f998e0fe70463732bc6a7c4.jpg',
        imageHint: 'welcome gift',
        offer: '10% OFF'
    },
    {
        title: 'Birthday & Anniversary Specials',
        content: '“Happy Birthday 🎉! Celebrate with us and enjoy a free dessert on your order today.”',
        why: 'Customers feel special → higher chance of visiting again.',
        imageUrl: 'https://i.pinimg.com/736x/97/67/7d/97677d0ad9b034f2aad012d2bf69a445.jpg',
        imageHint: 'birthday gift',
        offer: 'FREE DESSERT'
    },
    {
        title: 'Weekend Flash Sale',
        content: '“🔥 Weekend Special: Buy 1 Biryani, Get 1 Free (Friday–Sunday only). Limited orders, hurry!”',
        why: 'Creates urgency + boosts weekend sales.',
        imageUrl: 'https://i.pinimg.com/736x/78/6b/f4/786bf4d3b085acc2281c43a3cf81fdb0.jpg',
        imageHint: 'weekend sale',
        offer: 'BUY 1 GET 1'
    },
    {
        title: 'Festival Campaigns',
        content: '“Celebrate Diwali with our Festive Thali ✨ Pre-order now and get 15% off.”',
        why: 'Customers expect special menus & offers during festivals.',
        imageUrl: 'https://i.pinimg.com/736x/72/de/a7/72dea7823cb81842233673210a1c34e2.jpg',
        imageHint: 'festival food',
        offer: '15% OFF'
    },
    {
        title: 'Loyalty Reward Campaign',
        content: '“You’ve ordered 5 times with us! 🎁 Your next starter is on us.”',
        why: 'Builds long-term loyalty & repeat orders.',
        imageUrl: 'https://i.pinimg.com/736x/ff/3a/32/ff3a3286f81b9de422e8eea422311210.jpg',
        imageHint: 'loyalty reward',
        offer: 'FREE STARTER'
    },
    {
        title: 'Re-engagement Campaign',
        content: '“We miss you! Come back and enjoy 20% off on your next order. Use code: WEMISSYOU.”',
        why: 'Brings back customers who haven’t ordered in 30+ days.',
        imageUrl: 'https://i.pinimg.com/736x/fa/d9/7a/fad97aeefdad2f391bf2e00c704d1b72.jpg',
        imageHint: 're-engagement',
        offer: '20% OFF'
    },
    {
        title: 'New Menu Launch',
        content: '“Introducing our new Butter Chicken Pizza 🍕🔥 Available this weekend. Reply ‘YES’ to book your table.”',
        why: 'Creates excitement & curiosity.',
        imageUrl: 'https://i.pinimg.com/736x/4f/ed/02/4fed0299e175444c40909b6dba886dd9.jpg',
        imageHint: 'new menu item',
        offer: 'NEW ITEM'
    },
    {
        title: 'Feedback Campaign',
        content: '“How was your meal today? Rate us 1–5 🌟. Share your feedback & get 10% off your next order.”',
        why: 'Improves online reputation + encourages repeat purchase.',
        imageUrl: 'https://i.pinimg.com/736x/dd/61/35/dd6135527edbce6cedbe8bf23c8106bb.jpg',
        imageHint: 'customer feedback',
        offer: 'GET 10% OFF'
    },
    {
        title: 'Event Promotion',
        content: '“Live Music Night 🎶 at Beans Cafe this Saturday! Book your table now.”',
        why: 'Boosts dine-in sales & creates community buzz.',
        imageUrl: 'https://i.pinimg.com/736x/6b/0a/ec/6b0aec27834c327e679cff8a73d3f61c.jpg',
        imageHint: 'live music event',
        offer: 'LIVE MUSIC'
    }
];

const smartAddons = [
    {
        title: 'Join Loyalty Program',
        description: 'Reward repeat customers with points, discounts, and exclusive offers to keep them coming back.',
        imageUrl: 'https://i.pinimg.com/736x/e5/9e/c4/e59ec48d3210266a140cb6441d20da0e.jpg',
        imageHint: 'loyalty program',
        icon: <Award size={16} />,
        whatsappMessage: "Hi, I'm interested in the Loyalty Program add-on for my restaurant."
    },
    {
        title: 'Payment Integration',
        description: 'Accept secure online payments seamlessly with multiple options like UPI, cards, and wallets.',
        imageUrl: 'https://i.pinimg.com/736x/98/4b/43/984b43a9bb165c2f24f453b7dc7dd228.jpg',
        imageHint: 'payment integration',
        icon: <CreditCard size={16} />,
        whatsappMessage: "Hi, I'm interested in the Payment Integration add-on for my restaurant."
    },
    {
        title: 'Delivery Integration',
        description: 'Connect with top delivery partners to manage and track orders smoothly in one place.',
        imageUrl: 'https://i.pinimg.com/736x/f6/bb/ee/f6bbeea559cd245a50525f88f9e9b767.jpg',
        imageHint: 'delivery integration',
        icon: <Truck size={16} />,
        whatsappMessage: "Hi, I'm interested in the Delivery Integration add-on for my restaurant."
    },
    {
        title: 'Order via Table QR Code',
        description: 'Let diners scan a QR code to view the menu, place orders, and pay contactless and hassle-free.',
        imageUrl: 'https://i.pinimg.com/736x/53/85/b5/5385b5e9de18b2624d296bf46660fc2f.jpg',
        imageHint: 'qr code order',
        icon: <QrCode size={16} />,
        whatsappMessage: "Hi, I'm interested in the Table QR Code Ordering add-on for my restaurant."
    },
    {
        title: 'Customizable Coupon Codes',
        description: 'Create and share unique discount codes to attract customers and boost repeat sales',
        imageUrl: 'https://i.pinimg.com/736x/6b/08/31/6b08319c34571c01e76c02674f6164a2.jpg',
        imageHint: 'coupon codes',
        icon: <Tag size={16} />,
        whatsappMessage: "Hi, I'm interested in the Customizable Coupon Codes add-on for my restaurant."
    },
    {
        title: 'Feedback Tracking System',
        description: 'Collect and monitor customer reviews to improve service and build stronger loyalty.',
        imageUrl: 'https://i.pinimg.com/736x/a5/d5/52/a5d55222120253c0572e338ca2cbfc6b.jpg',
        imageHint: 'feedback system',
        icon: <FeedbackIcon size={16} />,
        whatsappMessage: "Hi, I'm interested in the Feedback Tracking System add-on for my restaurant."
    },
    {
        title: 'WhatsApp Messaging Tool',
        description: 'Instantly connect with your customers through WhatsApp—send offers, order updates, and reminders with just one click.',
        imageUrl: 'https://i.pinimg.com/736x/05/ed/32/05ed32b92799864762e0cf5a53081370.jpg',
        imageHint: 'whatsapp tool',
        icon: <WhatsAppIcon size={16} />,
        whatsappMessage: "Hi, I'm interested in the WhatsApp Messaging Tool add-on for my restaurant."
    }
];


const MarketingPage = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [dataLoading, setDataLoading] = useState(true);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [manualEmails, setManualEmails] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });

    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [sendgridApiKey, setSendgridApiKey] = useState('');
    const [isSavingApiKey, setIsSavingApiKey] = useState(false);
    const [growthCarouselIndex, setGrowthCarouselIndex] = useState(0);
    const [addonCarouselIndex, setAddonCarouselIndex] = useState(0);

    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const growthHacksRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleScrollToGrowthHacks = () => {
        if (growthHacksRef.current) {
            growthHacksRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const showConfirmationModal = (props) => {
        setConfirmationModalProps(props);
        setIsConfirmationModalOpen(true);
    };

    const handleNavigateToAnalytics = () => {
        showConfirmationModal({
            title: 'Navigate to Analytics',
            message: 'Are you sure you want to leave this page and go to the analytics dashboard?',
            onConfirm: () => router.push('/dashboard/analytics'),
        });
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/dashboard/login');
        }
    }, [user, loading, router]);


    useEffect(() => {
        const fetchApiKey = async () => {
            if (!user) return;
            setDataLoading(true);
            try {
                const keyDoc = await getDoc(doc(db, 'settings', 'sendgrid'));
                if (keyDoc.exists()) {
                    setSendgridApiKey(keyDoc.data().apiKey);
                }
            } catch (error) {
                console.warn("Could not fetch API key from settings. This might be due to Firestore rules. The app will rely on the environment variable as a fallback.", error);
            } finally {
                setDataLoading(false);
            }
        };
        fetchApiKey();
    }, [user]);

    const handleSaveApiKey = async () => {
        setIsSavingApiKey(true);
        try {
            await setDoc(doc(db, 'settings', 'sendgrid'), { apiKey: sendgridApiKey });
            setIsApiModalOpen(false);
            setFeedbackMessage({ type: 'success', text: 'API Key saved successfully!' });
        } catch (error) {
            console.error('Failed to save API key:', error);
            setFeedbackMessage({ type: 'error', text: 'Failed to save API key. Check Firestore rules or .env file.' });
        } finally {
            setIsSavingApiKey(false);
        }
    };


    const handleLogout = () => {
        auth.signOut();
        router.push('/dashboard/login');
    };

    const handleSendEmail = async () => {
        if (!subject || !body) {
            setFeedbackMessage({ type: 'error', text: 'Please fill in both subject and body.' });
            return;
        }
        setIsSending(true);
        setFeedbackMessage({ type: '', text: '' });
        try {
            await sendPromotionalEmail({ subject, body, manualEmails });
            setFeedbackMessage({ type: 'success', text: 'Email campaign sent successfully!' });
            setSubject('');
            setBody('');
            setManualEmails('');
        } catch (error) {
            console.error('Failed to send email:', error);
            setFeedbackMessage({ type: 'error', text: 'Failed to send email. Check API key and try again.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleExportCustomers = async (filters) => {
        try {
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const customerData = new Map();

            ordersSnapshot.forEach(doc => {
                const order = doc.data();
                if (order.customer && order.customer.phone) {
                    const phone = order.customer.phone;
                    const status = order.status; // 'Delivered' or 'Declined'

                    // Determine if we should process this order based on status filter
                    if (filters.orderStatus !== 'All' && filters.orderStatus !== status) {
                        return;
                    }

                    if (!customerData.has(phone)) {
                        customerData.set(phone, {
                            name: order.customer.name,
                            email: order.customer.email || 'N/A',
                            phone: phone,
                            totalSpent: 0,
                            orderCount: 0,
                            lastPurchase: new Timestamp(0, 0)
                        });
                    }

                    const customer = customerData.get(phone);
                    // Only count totals for delivered orders
                    if (status === 'Delivered') {
                        customer.totalSpent += order.total;
                        customer.orderCount += 1;
                        if (order.timestamp.toMillis() > customer.lastPurchase.toMillis()) {
                            customer.lastPurchase = order.timestamp;
                        }
                    }
                }
            });

            let filteredCustomers = Array.from(customerData.values());

            if (filters.lastPurchaseDate) {
                const filterDate = new Date(filters.lastPurchaseDate);
                // Adjust to the end of the day for '<=' comparison to be inclusive
                if (filters.lastPurchaseCondition === 'lte') {
                    filterDate.setHours(23, 59, 59, 999);
                } else {
                    filterDate.setHours(0, 0, 0, 0);
                }
                const filterTimestamp = filterDate.getTime();

                filteredCustomers = filteredCustomers.filter(c => {
                    const purchaseDate = c.lastPurchase.toDate().getTime();
                    if (purchaseDate === new Timestamp(0, 0).toDate().getTime()) return false; // Exclude customers with no delivered purchases
                    return filters.lastPurchaseCondition === 'gte' ? purchaseDate >= filterTimestamp : purchaseDate <= filterTimestamp;
                });
            }
            if (filters.totalOrderValue) {
                const filterValue = Number(filters.totalOrderValue);
                filteredCustomers = filteredCustomers.filter(c => {
                    return filters.totalOrderValueCondition === 'gte' ? c.totalSpent >= filterValue : c.totalSpent <= filterValue;
                });
            }
            if (filters.totalOrdersCount) {
                const filterCount = Number(filters.totalOrdersCount);
                filteredCustomers = filteredCustomers.filter(c => {
                    return filters.totalOrdersCountCondition === 'gte' ? c.orderCount >= filterCount : c.orderCount <= filterCount;
                });
            }

            if (filteredCustomers.length === 0) {
                alert("No customers found matching the specified criteria.");
                return;
            }

            const exportData = filteredCustomers.map(c => ({
                'Name': c.name,
                'Email': c.email,
                'Phone': c.phone,
                'Total Spent (INR)': c.totalSpent.toFixed(2),
                'Total Orders': c.orderCount,
                'Last Purchase Date': c.lastPurchase.toDate().toLocaleDateString()
            }));

            const worksheet = utils.json_to_sheet(exportData);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Customers');
            writeFile(workbook, 'BiryaniCorner_Customers_Export.xlsx');
            setIsExportModalOpen(false);

        } catch (error) {
            console.error("Error exporting customer data:", error);
            alert("Failed to export data. Please try again.");
        }
    };

    const renderContent = () => {
        if (!isClient || loading || dataLoading) {
            return <MarketingPageSkeleton />;
        }
        if (!user || user.email !== 'team.celvix@gmail.com') {


            return <AccessDenied />;
        }
        return (
            <main className="w-full px-4 sm:px-6 py-6 pb-20 md:pb-6 overflow-x-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Marketing</h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleNavigateToAnalytics} className='flex items-center space-x-2 text-sm font-semibold p-2 rounded-lg hover:bg-gray-100 transition-colors border bg-white shadow-sm'>
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Analytics</span>
                        </button>
                        <button onClick={() => setIsExportModalOpen(true)} className='flex items-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-white text-gray-800 hover:bg-gray-50 transition-colors border shadow-sm'>
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Customers</span>
                        </button>
                    </div>
                </div>
                <div className="relative w-full h-64 rounded-xl overflow-hidden mb-8">
                    <Image
                        src="https://i.pinimg.com/736x/f6/13/b0/f613b049cf1274b8ab6e2be4a450f8ab.jpg"
                        alt="Marketing background"
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="marketing background"
                    />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="absolute inset-0 flex flex-col items-start justify-end text-left text-white p-6">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="h-12 w-12 mb-2" />
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold">Boost Repeat Orders Instantly</h2>
                                <p className="mt-1 text-sm md:text-base max-w-xl">
                                    Engage customers on WhatsApp &amp; Email with exclusive offers, updates, and loyalty rewards.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h1 className="text-2xl font-bold">Marketing Resources</h1>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6 mt-4">
                        <div onClick={handleScrollToGrowthHacks} className="bg-white p-4 rounded-lg shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow">
                            <Lightbulb className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <h3 className="font-semibold">Campaign Ideas</h3>
                            <p className="text-xs text-muted-foreground mt-1">Get inspiration for your next promotional campaign, from holiday specials to loyalty rewards.</p>
                        </div>
                        <div onClick={() => setIsExportModalOpen(true)} className="bg-white p-4 rounded-lg shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow">
                            <Target className="h-8 w-8 mx-auto text-red-500 mb-2" />
                            <h3 className="font-semibold">Targeting Guide</h3>
                            <p className="text-xs text-muted-foreground mt-1">Learn how to use filters to reach specific customer segments like VIPs or inactive users.</p>
                        </div>
                        <div onClick={handleScrollToGrowthHacks} className="bg-white p-4 rounded-lg shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow">
                            <MessageCircle className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                            <h3 className="font-semibold">Writing Effective Copy</h3>
                            <p className="text-xs text-muted-foreground mt-1">Tips for writing short, engaging messages that drive orders on email and WhatsApp.</p>
                        </div>
                        <div onClick={handleNavigateToAnalytics} className="bg-white p-4 rounded-lg shadow-sm border text-center cursor-pointer hover:shadow-md transition-shadow">
                            <BarChartHorizontal className="h-8 w-8 mx-auto text-senoa-green mb-2" />
                            <h3 className="font-semibold">Analyze Results</h3>
                            <p className="text-xs text-muted-foreground mt-1">Use the Analytics page to track the success of your campaigns and see your sales grow.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                        <div className="border-b pb-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Create Email Campaign</h2>
                                <button onClick={() => setIsApiModalOpen(true)} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-gray-800 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </button>
                            </div>
                            <div className="flex items-center mt-2 space-x-3">
                                <div className='border rounded-md p-1 bg-white'>
                                    <Image src="https://i.pinimg.com/736x/32/ec/71/32ec71adaed17836f7473cd9efe2b3d5.jpg" alt="sendgrid logo" width={70} height={20} />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    To increase the limit, please upgrade to a paid plan on SendGrid. <a href="https://sendgrid.com/en-us/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Check Pricing</a>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</label>
                                <div className="relative mt-1">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="subject"
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g. Weekend Special: 20% Off!"
                                        className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="body" className="text-sm font-semibold text-gray-700">Body</label>
                                <div className="relative mt-1">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <textarea
                                        id="body"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Write your email content here. You can include details about offers, new items, etc."
                                        className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none h-48"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="manual-emails" className="text-sm font-semibold text-gray-700">Manual Emails (Optional)</label>
                                <div className="relative mt-1">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <textarea
                                        id="manual-emails"
                                        value={manualEmails}
                                        onChange={(e) => setManualEmails(e.target.value)}
                                        placeholder="Enter emails, separated by commas or new lines..."
                                        className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none h-24"
                                    />
                                </div>
                            </div>
                        </div>

                        {feedbackMessage.text && (
                            <p className={`text-sm text-center ${feedbackMessage.type === 'error' ? 'text-red-600' : 'text-senoa-green'}`}>
                                {feedbackMessage.text}
                            </p>
                        )}

                        <div className="pt-4">
                            <button
                                onClick={handleSendEmail}
                                disabled={isSending}
                                className="w-full flex items-center justify-center space-x-2 text-base font-semibold p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                            >
                                {isSending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                                <span>{isSending ? 'Sending...' : 'Send Emails'}</span>
                            </button>
                        </div>
                        <div className="border-t pt-6 text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                                If you’d like to send 100 emails per day permanently, instead of relying on SendGrid’s 60-day trial, contact us to create a custom tool for you.
                            </p>
                            <a
                                href="https://wa.me/917979057085?text=Hi%2C%20I%E2%80%99d%20like%20you%20to%20build%20a%20custom%20tool%20for%20us%20that%20can%20send%20up%20to%20100%20emails%20per%20day%2C%20free%20of%20cost%2C%20on%20a%20permanent%20basis."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-gray-900"
                            >
                                Contact us
                            </a>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="relative mb-4">
                            <Image src="https://i.pinimg.com/736x/ce/c9/60/cec9602bbf2724dfe52c041be0677675.jpg" alt="WhatsApp Marketing" width={500} height={200} className="rounded-lg object-cover w-full h-auto" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-lg"></div>
                            <a
                                href="https://wa.me/7979057085?text=Hi%2C%20I%E2%80%99d%20like%20to%20use%20the%20WhatsApp%20add-on%20to%20connect%20with%20customers"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-4 left-4 bg-senoa-green text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:bg-senoa-green-dark hover:scale-105 hover:brightness-110"
                            >
                                Get Add-on
                            </a>
                        </div>
                        <h2 className="text-xl font-bold">WhatsApp Marketing tool addon</h2>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">Features:</p>
                        <ul className="space-y-2 text-sm text-gray-800">
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Unlimited Messaging</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Send Attachments</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Message Customization</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Save Message Template</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Detailed Delivery Report</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Translate Conversation</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Batching</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Quick Replies</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Group Contacts Export</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Multiple Attachments</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Schedule Campaign</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Pause Campaign</li>
                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-senoa-green" />Export Unsaved Chat Contacts</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16" ref={growthHacksRef}>
                    <div className="flex items-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center mr-4">
                            <TrendingUp className="h-8 w-8 mr-3" />
                            Digital Growth Hacks
                        </h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setGrowthCarouselIndex(prev => Math.max(prev - 1, 0))}
                                className="p-2 rounded-full border bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                disabled={growthCarouselIndex === 0}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setGrowthCarouselIndex(prev => Math.min(prev + 1, growthHacks.length - 3))}
                                className="p-2 rounded-full border bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                                disabled={growthCarouselIndex >= growthHacks.length - 3}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out -ml-2"
                                style={{ transform: `translateX(calc(-${growthCarouselIndex * (100 / 3)}% + ${growthCarouselIndex * 0}px))` }}
                            >
                                {growthHacks.map((hack, index) => (
                                    <div key={index} className="w-full md:w-[calc(100%/3)] flex-shrink-0 px-2">
                                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full flex flex-col">
                                            <div className="relative w-full h-80">
                                                <Image
                                                    src={hack.imageUrl}
                                                    alt={hack.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    data-ai-hint={hack.imageHint}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                                <div className="absolute top-4 left-4 flex space-x-2">
                                                    <button className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-transform hover:scale-110">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.451-4.437-9.887-9.888-9.888-5.451 0-9.887 4.436-9.888 9.888.001 2.228.651 4.385 1.886 6.245l-1.254 4.585 4.703-1.233zM9.351 8.298c-.144-.346-.3-.356-.44-.362-.14-.006-.3-.008-.46-.008-.16 0-.41.06-.62.311-.21.25-.85.83-.85 2.02.001 1.191.87 2.341 1 2.491.13.15 1.76 2.67 4.25 3.73.59.25 1.05.4 1.41.52.59.21 1.12.18 1.54.11.46-.08.85-.36 1.03-.72.18-.36.18-.68.12-.76-.06-.08-.21-.13-.44-.24-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.15.24-.59.75-.73.9-.14.15-.28.17-.51.05-.23-.12-.99-.36-1.89-1.16-.7-.6-1.17-1.34-1.3-1.56-.13-.22-.02-.34.09-.44.1-.1.22-.26.33-.39.11-.12.14-.21.21-.35.07-.14.04-.26-.02-.34z" /></svg>
                                                    </button>
                                                    <button className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-transform hover:scale-110">
                                                        <Mail size={20} />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-4 left-4 text-white flex items-center space-x-2">
                                                    <Megaphone size={32} className="drop-shadow-lg" />
                                                    <span className="font-black text-3xl drop-shadow-lg">{hack.offer}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-2 flex-grow flex flex-col">
                                                <h3 className="font-bold text-lg">{hack.title}</h3>
                                                <p className="text-sm text-muted-foreground flex flex-grow items-start">
                                                    <MessageCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>{hack.content}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground flex mt-auto pt-2 items-start">
                                                    <Lightbulb className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-yellow-500" />
                                                    <span><span className="font-semibold text-senoa-green">Why it works:</span> {hack.why}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <div className="flex items-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center mr-4">
                            <TrendingUp className="h-8 w-8 mr-3" />
                            Smart Add-Ons
                        </h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setAddonCarouselIndex(prev => Math.max(prev - 1, 0))}
                                className="p-2 rounded-full border bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                disabled={addonCarouselIndex === 0}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setAddonCarouselIndex(prev => Math.min(prev + 1, smartAddons.length - 3))}
                                className="p-2 rounded-full border bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-50"
                                disabled={addonCarouselIndex >= smartAddons.length - 3}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out -ml-2"
                                style={{ transform: `translateX(calc(-${addonCarouselIndex * (100 / 3)}% + ${addonCarouselIndex * 0}px))` }}
                            >
                                {smartAddons.map((addon, index) => (
                                    <div key={index} className="w-full md:w-[calc(100%/3)] flex-shrink-0 px-2">
                                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden h-full flex flex-col">
                                            <div className="relative w-full h-80">
                                                <Image
                                                    src={addon.imageUrl}
                                                    alt={addon.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    data-ai-hint={addon.imageHint}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                                                <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
                                                    {addon.icon}
                                                </div>
                                                <a
                                                    href={`https://wa.me/917979057085?text=${encodeURIComponent(addon.whatsappMessage)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-4 right-4 bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-transform hover:scale-110 flex items-center space-x-1"
                                                >
                                                    <Plus size={16} />
                                                    <span className="font-bold text-xs pr-1">Add</span>
                                                </a>
                                            </div>
                                            <div className="p-4 space-y-2 flex-grow flex flex-col">
                                                <h3 className="font-bold text-lg">{addon.title}</h3>
                                                <p className="text-sm text-muted-foreground flex flex-grow">
                                                    <span>{addon.description}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='pb-16'></div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                title={confirmationModalProps.title}
                message={confirmationModalProps.message}
                onConfirm={confirmationModalProps.onConfirm}
            />
            <ApiSettingsModal
                isOpen={isApiModalOpen}
                onClose={() => setIsApiModalOpen(false)}
                apiKey={sendgridApiKey}
                setApiKey={setSendgridApiKey}
                onSave={handleSaveApiKey}
                isSaving={isSavingApiKey}
            />
            <CustomerExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExportCustomers}
            />

            {renderContent()}
        </div>
    );
};

export default MarketingPage;
