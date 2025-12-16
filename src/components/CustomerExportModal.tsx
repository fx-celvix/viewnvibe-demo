
'use client';

import { useState } from 'react';
import { X, Calendar, IndianRupee, Hash, ClipboardList, ChevronDown, Info, Lightbulb, Download } from 'lucide-react';

const FilterInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const Section = ({ title, children }) => (
        <div className="border-b last:border-b-0 py-3">
            <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Filter Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto text-sm text-gray-700">
                    <Section title="1. Last Purchase Date">
                        <p>This filter looks at the date when the customer last ordered from your restaurant.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li><span className="font-semibold">Greater than or equal to (≥):</span> Selects customers who ordered on or after a certain date.
                                <br/><span className="text-gray-500 ml-4">Example: If you set it to 01 July 2025 (≥), you’ll get customers who placed an order on or after 1st July.</span>
                            </li>
                            <li><span className="font-semibold">Less than or equal to (≤):</span> Selects customers who ordered on or before a certain date.
                                <br/><span className="text-gray-500 ml-4">Example: If you set it to 30 June 2025 (≤), you’ll get customers who last ordered on or before 30th June.</span>
                            </li>
                        </ul>
                        <p className="mt-2 text-xs font-semibold">✅ Use Case: Helps you find recently active customers or inactive customers who haven’t ordered in a while.</p>
                    </Section>
                    
                    <Section title="2. Total Order Value">
                        <p>This filter looks at the total money a customer has spent at your restaurant.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li><span className="font-semibold">Greater than or equal to (≥):</span> Selects customers who spent at least that amount.
                                <br/><span className="text-gray-500 ml-4">Example: If you set ≥ 1000, you’ll get customers who spent ₹1000 or more.</span>
                            </li>
                            <li><span className="font-semibold">Less than or equal to (≤):</span> Selects customers who spent up to that amount.
                                <br/><span className="text-gray-500 ml-4">Example: If you set ≤ 500, you’ll get customers who spent ₹500 or less.</span>
                            </li>
                        </ul>
                        <p className="mt-2 text-xs font-semibold">✅ Use Case: Helps you identify big spenders (loyal customers) or budget customers for targeted offers.</p>
                    </Section>

                    <Section title="3. Total Orders Count">
                        <p>This filter looks at how many times a customer has ordered.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li><span className="font-semibold">Greater than or equal to (≥):</span> Selects customers who ordered at least that many times.
                                <br/><span className="text-gray-500 ml-4">Example: If you set ≥ 5, you’ll get customers who ordered 5 times or more.</span>
                            </li>
                            <li><span className="font-semibold">Less than or equal to (≤):</span> Selects customers who ordered up to that many times.
                                <br/><span className="text-gray-500 ml-4">Example: If you set ≤ 2, you’ll get customers who ordered 2 times or less.</span>
                            </li>
                        </ul>
                        <p className="mt-2 text-xs font-semibold">✅ Use Case: Helps you find repeat customers (loyal) or one-time customers (who need re-engagement).</p>
                    </Section>
                    
                     <Section title="🔑 How to Use Filters Together">
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li>You can apply one filter or combine multiple filters.</li>
                            <li><span className="font-semibold">Example 1:</span> Last Purchase Date ≤ 30 June 2025 + Total Orders Count ≤ 2 → Shows inactive customers who ordered only once or twice.</li>
                            <li><span className="font-semibold">Example 2:</span> Total Order Value ≥ 2000 + Total Orders Count ≥ 5 → Shows loyal customers who spend a lot and order frequently.</li>
                        </ul>
                    </Section>

                    <Section title="👉 In short:">
                         <ul className="list-disc list-inside space-y-1">
                            <li><span className="font-semibold">Date filter</span> = When they last ordered</li>
                            <li><span className="font-semibold">Value filter</span> = How much they spent</li>
                            <li><span className="font-semibold">Count filter</span> = How many times they ordered</li>
                         </ul>
                    </Section>
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-xl">
                    <button onClick={onClose} className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
};

const StrategyInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const Section = ({ title, children }) => (
        <div className="border-b last:border-b-0 py-3">
            <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Campaign Strategies with Filters</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto text-sm text-gray-700">
                    <Section title="1. Last Purchase Date">
                        <p className='font-semibold'>🎯 Goal: Bring back inactive customers / keep recent ones engaged.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li><span className="font-semibold">Inactive customers (Last Purchase Date ≤ 30 days ago):</span>
                                <br/><span className="text-gray-500 ml-4">Message: “We miss you! 🥘 Come back and enjoy 20% off on your next order.”</span>
                                <br/><span className="text-gray-500 ml-4">Strategy: Send a reactivation coupon to those who haven’t ordered in a while.</span>
                            </li>
                             <li><span className="font-semibold">Recently active (Last Purchase Date ≥ 7 days ago):</span>
                                <br/><span className="text-gray-500 ml-4">Message: “Thanks for ordering recently! ❤️ Here’s a special free dessert with your next meal.”</span>
                                <br/><span className="text-gray-500 ml-4">Strategy: Keep them engaged and turn them into loyal customers.</span>
                            </li>
                        </ul>
                    </Section>
                    
                    <Section title="2. Total Order Value">
                        <p className='font-semibold'>🎯 Goal: Reward big spenders &amp; engage budget customers.</p>
                         <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li><span className="font-semibold">High spenders (Total Order Value ≥ ₹2000):</span>
                                <br/><span className="text-gray-500 ml-4">Message: “You’re one of our VIP customers! 🎉 Enjoy exclusive 25% off this weekend.”</span>
                                <br/><span className="text-gray-500 ml-4">Strategy: Build loyalty by rewarding them with VIP perks.</span>
                            </li>
                             <li><span className="font-semibold">Low spenders (Total Order Value ≤ ₹500):</span>
                                <br/><span className="text-gray-500 ml-4">Message: “Try something new! 🍲 Get 10% off on our premium biryani today.”</span>
                                <br/><span className="text-gray-500 ml-4">Strategy: Upsell and increase average order value.</span>
                            </li>
                        </ul>
                    </Section>

                    <Section title="3. Total Orders Count">
                        <p className='font-semibold'>🎯 Goal: Turn one-time buyers into regulars, and reward repeat buyers.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                            <li><span className="font-semibold">One-time / low frequency (Orders Count ≤ 2):</span>
                                <br/><span className="text-gray-500 ml-4">Message: “Loved your first order? Order again today and get free delivery 🚚.”</span>
                                <br/><span className="text-gray-500 ml-4">Strategy: Encourage second/third purchase to build habit.</span>
                            </li>
                             <li><span className="font-semibold">Frequent buyers (Orders Count ≥ 5):</span>
                                <br/><span className="text-gray-500 ml-4">Message: “You’re part of our foodie family! 🍴 Here’s a loyalty reward: Flat 30% off.”</span>
                                <br/><span className="text-gray-500 ml-4">Strategy: Strengthen loyalty with rewards or a “VIP Club.”</span>
                            </li>
                        </ul>
                    </Section>
                    
                     <Section title="🔗 Combined Campaign Ideas">
                        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                           <li><span className="font-semibold">Inactive + Low Order Count:</span> “It’s been a while! Come back today and enjoy 20% off on your next order.”</li>
                           <li><span className="font-semibold">High Value + Frequent Buyers:</span> “You’re a true foodie! 🎉 Get an exclusive invite to our Chef’s Special menu this weekend.”</li>
                           <li><span className="font-semibold">Low Spend + Recent Date:</span> “Thanks for your recent order! Next time, try our family combo at a special price.”</li>
                        </ul>
                    </Section>

                    <Section title="✅ Best Practices for WhatsApp Campaigns">
                         <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>Keep messages short &amp; friendly (use emojis 🍛🔥).</li>
                            <li>Add direct CTA buttons (e.g., “Order Now” link).</li>
                            <li>Personalize if possible (use customer name).</li>
                            <li>Don’t spam — 1-2 targeted messages per week max.</li>
                         </ul>
                    </Section>
                </div>
                 <div className="p-4 bg-gray-50 rounded-b-xl">
                    <button onClick={onClose} className="w-full px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300">Close</button>
                </div>
            </div>
        </div>
    );
};


export const CustomerExportModal = ({ isOpen, onClose, onExport }) => {
    const [filters, setFilters] = useState({
        lastPurchaseDate: '',
        lastPurchaseCondition: 'gte',
        totalOrderValue: '',
        totalOrderValueCondition: 'gte',
        totalOrdersCount: '',
        totalOrdersCountCondition: 'gte',
        orderStatus: 'All'
    });
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({...prev, [field]: value}));
    };
    
    const handleExportClick = () => {
        onExport(filters);
    };

    if (!isOpen) return null;

    const FilterInput = ({ label, icon, placeholder, value, onChange, condition, onConditionChange, type = 'number' }) => (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
              {label} <Info size={12} className="ml-1 text-gray-400 cursor-pointer" onClick={() => setIsInfoModalOpen(true)} />
            </label>
            <div className="flex items-center space-x-2">
                <div className="relative flex-grow">
                    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400">{icon}</div>}
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <select value={condition} onChange={(e) => onConditionChange(e.target.value)} className="text-sm border rounded-md px-2 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white">
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                </select>
            </div>
        </div>
    );


    return (
        <>
            <FilterInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
            <StrategyInfoModal isOpen={isStrategyModalOpen} onClose={() => setIsStrategyModalOpen(false)} />
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b flex justify-between items-center">
                         <div className="flex items-center space-x-2">
                            <svg className="h-5 w-5 text-senoa-green" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23 1.5H1v14h10.5v1.5H9.429V19h5.143v-2h-2.072v-1.5H23V1.5zM21.5 14H2.5V3h19v11zM6.143 20.571V21H4v1.5h16V21h-2.143v-0.429H6.143zM8.214 22.5h7.572v-1H8.214v1z"/><path d="M8 5.5h8v1H8zM8 8.5h8v1H8zM5.5 5.5h1v1h-1zM5.5 8.5h1v1h-1z"/></svg>
                            <h2 className="text-lg font-bold">Customer Data Export</h2>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setIsStrategyModalOpen(true)} className="text-gray-400 hover:text-blue-600"><Lightbulb size={20} /></button>
                            <button onClick={onClose}><X size={24} /></button>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-gray-700">
                            Download customer data tailored to your marketing strategy.
                        </p>
                        <div className="space-y-4">
                            <FilterInput
                                label="Last Purchase Date"
                                icon={<Calendar size={16}/>}
                                placeholder="dd/mm/yyyy"
                                type="date"
                                value={filters.lastPurchaseDate}
                                onChange={(val) => handleFilterChange('lastPurchaseDate', val)}
                                condition={filters.lastPurchaseCondition}
                                onConditionChange={(val) => handleFilterChange('lastPurchaseCondition', val)}
                            />
                             <FilterInput
                                label="Total Order Value"
                                icon={<IndianRupee size={16}/>}
                                placeholder="e.g. 1000"
                                value={filters.totalOrderValue}
                                onChange={(val) => handleFilterChange('totalOrderValue', val)}
                                condition={filters.totalOrderValueCondition}
                                onConditionChange={(val) => handleFilterChange('totalOrderValueCondition', val)}
                            />
                             <FilterInput
                                label="Total Orders Count"
                                icon={<Hash size={16}/>}
                                placeholder="e.g. 5"
                                value={filters.totalOrdersCount}
                                onChange={(val) => handleFilterChange('totalOrdersCount', val)}
                                condition={filters.totalOrdersCountCondition}
                                onConditionChange={(val) => handleFilterChange('totalOrdersCountCondition', val)}
                            />
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center">
                                    Order Status <Info size={12} className="ml-1 text-gray-400 cursor-pointer" onClick={() => setIsInfoModalOpen(true)} />
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"><ClipboardList size={16}/></div>
                                    <select
                                        value={filters.orderStatus}
                                        onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                                        className="w-full border rounded-md px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white appearance-none"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Declined">Declined/Canceled</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100">Cancel</button>
                        <button onClick={handleExportClick} className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
