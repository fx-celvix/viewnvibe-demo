
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, PlusCircle, Trash2, Edit, Save, X, ChevronDown, ChevronUp, Image as ImageIcon, IndianRupee, BookOpen, GripVertical, Plus, Minus, Link as LinkIcon, Percent, Phone, ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import dynamic from 'next/dynamic';
import { EditMenuPageSkeleton } from '@/components/skeletons/EditMenuPageSkeleton';
import { Upload } from 'lucide-react';

const ConfirmationModal = dynamic(() => import('@/components/ConfirmationModal').then(mod => mod.ConfirmationModal));
const BulkMenuUploadModal = dynamic(() => import('@/components/BulkMenuUploadModal').then(mod => mod.BulkMenuUploadModal));


interface Price {
    label: string;
    price: number | '';
}

interface MenuItem {
    name: string;
    description: string;
    prices: Price[];
    imageUrl: string;
    imageHint: string;
    isVeg: boolean;
    popular: boolean;
    mustTry: boolean;
    isNew: boolean;
    gst_percent: number | '';
}

interface MenuCategory {
    id: string;
    title: string;
    items: MenuItem[];
}


const ImageUrlModal = ({ isOpen, onClose, onSave }) => {
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (!isOpen) setUrl('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(url);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-lg font-bold">Set Image URL</h2>
                </div>
                <div className="p-4 space-y-3">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste image URL here..."
                        className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
                <div className="p-4 flex justify-end space-x-2 bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold rounded-md bg-senoa-green text-white hover:bg-senoa-green-dark">Save URL</button>
                </div>
            </div>
        </div>
    );
};


// Drag and drop is not implemented, GripVertical is for visual cue.

const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-50 text-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">Please contact the administrator if you believe this is an error.</p>
        <button onClick={() => auth.signOut()} className="mt-6 flex items-center space-x-2 text-sm font-semibold px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
        </button>
    </div>
);


const EditMenuPage = () => {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [isLoading, setIsLoading] = useState(true);
    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [confirmationModalProps, setConfirmationModalProps] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [imageUrlTarget, setImageUrlTarget] = useState<{ categoryId: string; itemIndex: number } | null>(null);

    const handleBulkData = (newCategories: MenuCategory[]) => {
        setMenuData(prevData => {
            const updatedData = [...prevData];

            newCategories.forEach(newCat => {
                const existingCatIndex = updatedData.findIndex(
                    c => c.title.toLowerCase().trim() === newCat.title.toLowerCase().trim()
                );

                if (existingCatIndex > -1) {
                    // Merge items
                    updatedData[existingCatIndex] = {
                        ...updatedData[existingCatIndex],
                        items: [...updatedData[existingCatIndex].items, ...newCat.items]
                    };
                    // Ensure the category is open so user sees changes
                    setOpenCategories(prev => ({ ...prev, [updatedData[existingCatIndex].id]: true }));
                } else {
                    // Add new category
                    updatedData.push(newCat);
                    setOpenCategories(prev => ({ ...prev, [newCat.id]: true }));
                }
            });

            return updatedData;
        });

        showConfirmationModal({
            title: 'Upload Successful',
            message: `Successfully imported items from Excel. Please review and click "Save All" to persist changes to the database.`,
            onConfirm: () => setIsConfirmationModalOpen(false),
            confirmText: 'OK',
            cancelText: null
        });
    };



    const showConfirmationModal = (props) => {
        setConfirmationModalProps(props);
        setIsConfirmationModalOpen(true);
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/dashboard/login');
        } else if (user) {
            const fetchMenu = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'menu'));
                    const menuItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuCategory[];
                    // Simple sort to have some order, can be improved with an 'order' field
                    menuItems.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                    setMenuData(menuItems);

                    // Initially open all categories
                    const allOpen = menuItems.reduce((acc, category) => {
                        acc[category.id] = true;
                        return acc;
                    }, {} as Record<string, boolean>);
                    setOpenCategories(allOpen);
                } catch (error) {
                    console.error("Error fetching menu:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchMenu();
        }
    }, [user, loading, router]);

    const handleLogout = () => {
        auth.signOut();
        router.push('/dashboard/login');
    };

    const handleAddNewCategory = () => {
        const newCategory: MenuCategory = {
            id: `category-${Date.now()}`,
            title: 'New Category',
            items: [],
        };
        setMenuData([newCategory, ...menuData]);
        setOpenCategories(prev => ({ ...prev, [newCategory.id]: true }));
    }

    const handleCategoryToggle = (categoryId: string) => {
        setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const handleCategoryTitleChange = (categoryId: string, newTitle: string) => {
        const updatedMenuData = menuData.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, title: newTitle };
            }
            return cat;
        });
        setMenuData(updatedMenuData);
    };

    const confirmRemoveCategory = (categoryId: string) => {
        showConfirmationModal({
            title: 'Delete Category',
            message: 'Are you sure you want to delete this entire category and all its items? This action cannot be undone.',
            onConfirm: () => removeCategory(categoryId),
            confirmText: 'Delete'
        });
    }

    const removeCategory = (categoryId: string) => {
        const updatedMenuData = menuData.filter(cat => cat.id !== categoryId);
        setMenuData(updatedMenuData);
    };


    const handleItemChange = (categoryId: string, itemIndex: number, field: keyof MenuItem, value: any) => {
        setMenuData(prevMenuData => {
            const updatedMenuData = [...prevMenuData];
            const categoryIndex = updatedMenuData.findIndex(cat => cat.id === categoryId);
            if (categoryIndex !== -1) {
                const updatedItems = [...updatedMenuData[categoryIndex].items];
                const itemToUpdate = { ...updatedItems[itemIndex] };
                (itemToUpdate[field] as any) = value;
                updatedItems[itemIndex] = itemToUpdate;
                updatedMenuData[categoryIndex] = { ...updatedMenuData[categoryIndex], items: updatedItems };
                return updatedMenuData;
            }
            return prevMenuData;
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string, itemIndex: number) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleItemChange(categoryId, itemIndex, 'imageUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openImageUrlModal = (categoryId: string, itemIndex: number) => {
        setImageUrlTarget({ categoryId, itemIndex });
        setIsImageUrlModalOpen(true);
    };

    const handleImageUrlSave = (url: string) => {
        if (imageUrlTarget && url) {
            handleItemChange(imageUrlTarget.categoryId, imageUrlTarget.itemIndex, 'imageUrl', url);
        }
    };

    const handlePriceChange = (categoryId: string, itemIndex: number, priceIndex: number, field: keyof Price, value: any) => {
        const updatedMenuData = [...menuData];
        const categoryIndex = updatedMenuData.findIndex(cat => cat.id === categoryId);
        if (field === 'price') {
            updatedMenuData[categoryIndex].items[itemIndex].prices[priceIndex][field] = value === '' ? '' : parseFloat(value) || 0;
        } else {
            updatedMenuData[categoryIndex].items[itemIndex].prices[priceIndex][field] = value;
        }
        setMenuData(updatedMenuData);
    }

    const handlePriceBlur = (categoryId: string, itemIndex: number, priceIndex: number, field: string) => {
        const updatedMenuData = [...menuData];
        const categoryIndex = updatedMenuData.findIndex(cat => cat.id === categoryId);
        if (field === 'price') {
            const price = updatedMenuData[categoryIndex].items[itemIndex].prices[priceIndex].price;
            if (price === '') {
                updatedMenuData[categoryIndex].items[itemIndex].prices[priceIndex].price = 0;
                setMenuData(updatedMenuData);
            }
        } else if (field === 'gst_percent') {
            const gst = updatedMenuData[categoryIndex].items[itemIndex].gst_percent;
            if (gst === '') {
                updatedMenuData[categoryIndex].items[itemIndex].gst_percent = 5; // default to 5%
                setMenuData(updatedMenuData);
            }
        }
    }


    const addPriceOption = (categoryId: string, itemIndex: number) => {
        const updatedMenuData = [...menuData];
        const categoryIndex = updatedMenuData.findIndex(cat => cat.id === categoryId);
        updatedMenuData[categoryIndex].items[itemIndex].prices.push({ label: '', price: 0 });
        setMenuData(updatedMenuData);
    };

    const removePriceOption = (categoryId: string, itemIndex: number, priceIndex: number) => {
        const updatedMenuData = [...menuData];
        const categoryIndex = updatedMenuData.findIndex(cat => cat.id === categoryId);
        updatedMenuData[categoryIndex].items[itemIndex].prices.splice(priceIndex, 1);
        setMenuData(updatedMenuData);
    };

    const addNewItem = (categoryId: string) => {
        const newItem: MenuItem = {
            name: 'New Item',
            description: '',
            prices: [{ label: 'Half', price: 0 }, { label: 'Full', price: 0 }],
            imageUrl: 'https://placehold.co/150x150.webp',
            imageHint: 'new item',
            isVeg: true,
            popular: false,
            mustTry: false,
            isNew: false,
            gst_percent: 5,
        };
        const updatedMenuData = menuData.map(cat => {
            if (cat.id === categoryId) {
                return { ...cat, items: [...cat.items, newItem] };
            }
            return cat;
        });
        setMenuData(updatedMenuData);
    };

    const removeItem = (categoryId: string, itemIndex: number) => {
        const updatedMenuData = menuData.map(cat => {
            if (cat.id === categoryId) {
                const updatedItems = cat.items.filter((_, index) => index !== itemIndex);
                return { ...cat, items: updatedItems };
            }
            return cat;
        });
        setMenuData(updatedMenuData);
    };

    const confirmSaveChanges = () => {
        showConfirmationModal({
            title: 'Save Menu Changes',
            message: 'Are you sure you want to save these changes? This will update the menu across the entire website.',
            onConfirm: saveChanges,
            confirmText: 'Save'
        });
    };

    const saveChanges = async () => {
        try {
            const batch = writeBatch(db);

            // Fetch existing menu docs to find which ones to delete
            const existingDocsSnapshot = await getDocs(collection(db, 'menu'));
            const existingIds = new Set(existingDocsSnapshot.docs.map(d => d.id));
            const currentIds = new Set(menuData.map(c => c.id));

            // Delete categories that are no longer in the local state
            existingIds.forEach(id => {
                if (!currentIds.has(id)) {
                    batch.delete(doc(db, 'menu', id));
                }
            });

            // Set/Update all categories from local state
            menuData.forEach(category => {
                const { id, ...categoryData } = category;
                // Ensure all prices are numbers before saving
                categoryData.items.forEach(item => {
                    item.prices = item.prices.map(p => ({ ...p, price: parseFloat(p.price as any) || 0 }));
                    item.gst_percent = parseFloat(item.gst_percent as any) || 5;
                });
                const docRef = doc(db, 'menu', id);
                batch.set(docRef, categoryData);
            });

            await batch.commit();

            showConfirmationModal({
                title: 'Success',
                message: 'Menu changes have been saved successfully!',
                onConfirm: () => {
                    setIsConfirmationModalOpen(false);
                    // Optional: redirect or just close modal
                },
                confirmText: 'OK',
                cancelText: null
            });
        } catch (error) {
            console.error("Error saving menu:", error);
            showConfirmationModal({
                title: 'Error',
                message: 'An error occurred while saving the menu. Please try again.',
                onConfirm: () => setIsConfirmationModalOpen(false),
                confirmText: 'OK',
                cancelText: null
            });
        }
    };

    const renderContent = () => {
        if (loading || isLoading) {
            return <EditMenuPageSkeleton />;
        }
        if (!user || user.email !== 'team.celvix@gmail.com') {


            return <AccessDenied />;
        }
        return (
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Menu</h1>
                </div>
                <div className="sticky top-0 bg-gray-50 z-10 py-4 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold">Menu Categories</h2>
                        <div className="flex space-x-2 w-full sm:w-auto">
                            <button onClick={() => setIsBulkUploadModalOpen(true)} className="w-1/3 sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                                <Upload className="h-4 w-4" />
                                <span className="hidden md:inline">Bulk Upload</span>
                                <span className="md:hidden">Upload</span>
                            </button>
                            <button onClick={handleAddNewCategory} className="w-1/3 sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                <PlusCircle className="h-4 w-4" />
                                <span className="hidden md:inline">Add Category</span>
                                <span className="md:hidden">Add</span>
                            </button>

                            <button onClick={confirmSaveChanges} className="w-1/3 sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold px-4 py-2 rounded-lg bg-senoa-green text-white hover:bg-senoa-green-dark transition-colors shadow-md">
                                <Save className="h-4 w-4" />
                                <span className="hidden md:inline">Save All</span>
                                <span className="md:hidden">Save</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8 pb-24">
                    {menuData.map(category => (
                        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
                                <input
                                    type="text"
                                    value={category.title}
                                    onChange={(e) => handleCategoryTitleChange(category.id, e.target.value)}
                                    className="text-xl font-bold border-none focus:ring-0 outline-none w-full bg-transparent text-gray-800 placeholder-gray-400"
                                    placeholder="Category Name"
                                />
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => confirmRemoveCategory(category.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleCategoryToggle(category.id)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                                        {openCategories[category.id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {openCategories[category.id] && (
                                <div className="p-6 bg-gray-50/30 space-y-6">
                                    {category.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow duration-200 p-6 relative group">
                                            {/* Drag Handle */}
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 cursor-move text-gray-300 hover:text-gray-400 hidden sm:block">
                                                <GripVertical className="h-5 w-5" />
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-6 pl-0 sm:pl-8">
                                                {/* Image Section */}
                                                <div className="relative group/image flex-shrink-0">
                                                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-100">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            width={128}
                                                            height={128}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/e2e8f0/94a3b8?text=Image' }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <label htmlFor={`image-upload-${category.id}-${itemIndex}`} className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 cursor-pointer transition-colors" title="Upload Image">
                                                                <Upload className="h-4 w-4" />
                                                            </label>
                                                            <button onClick={() => openImageUrlModal(category.id, itemIndex)} className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors" title="Image URL">
                                                                <LinkIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <input
                                                        id={`image-upload-${category.id}-${itemIndex}`}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, category.id, itemIndex)}
                                                    />
                                                    <div className="text-[10px] text-gray-400 text-center mt-2">{item.imageHint || '150 x 150'}</div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-grow space-y-4">
                                                    {/* Top Row: Name & Delete */}
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-grow">
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => handleItemChange(category.id, itemIndex, 'name', e.target.value)}
                                                                className="w-full text-lg font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder-gray-400 bg-transparent"
                                                                placeholder="Item Name"
                                                            />
                                                            <div className="h-px bg-gray-100 mt-2 mb-3" />
                                                        </div>
                                                        <button
                                                            onClick={() => removeItem(category.id, itemIndex)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                            title="Delete Item"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    {/* Description */}
                                                    <textarea
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(category.id, itemIndex, 'description', e.target.value)}
                                                        className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 min-h-[80px] resize-y placeholder-gray-300"
                                                        placeholder="Description, e.g., 'Additional cheese topping to enhance richness.'"
                                                    />

                                                    {/* Pricing Section */}
                                                    <div className="flex flex-wrap items-center gap-4 py-2">
                                                        <BookOpen className="h-4 w-4 text-gray-400" />
                                                        {item.prices.map((price, priceIndex) => (
                                                            <div key={priceIndex} className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 hover:border-gray-300 transition-colors">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Label"
                                                                    value={price.label}
                                                                    onChange={(e) => handlePriceChange(category.id, itemIndex, priceIndex, 'label', e.target.value)}
                                                                    className="w-20 bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-700 placeholder-gray-400 font-medium"
                                                                />
                                                                <div className="w-px h-4 bg-gray-300 mx-2" />
                                                                <IndianRupee className="h-3 w-3 text-gray-400 mr-1" />
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={price.price}
                                                                    onChange={(e) => handlePriceChange(category.id, itemIndex, priceIndex, 'price', e.target.value)}
                                                                    onBlur={() => handlePriceBlur(category.id, itemIndex, priceIndex, 'price')}
                                                                    className="w-16 bg-transparent text-sm border-none focus:ring-0 p-0 text-gray-900 font-bold"
                                                                />
                                                                {item.prices.length > 1 && (
                                                                    <button
                                                                        onClick={() => removePriceOption(category.id, itemIndex, priceIndex)}
                                                                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addPriceOption(category.id, itemIndex)} className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                                                            <Plus className="h-3 w-3 mr-1" /> Add Price
                                                        </button>
                                                    </div>

                                                    {/* Badges & Options */}
                                                    <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-50 mt-2">
                                                        <label className="flex items-center space-x-2 cursor-pointer group/check">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.isVeg ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover/check:border-green-500'}`}>
                                                                {item.isVeg && <div className="w-2.5 h-2.5 bg-white rounded-full sm:rounded-[1px]" />}
                                                                {/* Using a custom dot for Veg symbol style if needed, or checkmark */}
                                                                {item.isVeg && <div className="hidden sm:block text-white text-[10px] font-bold">✓</div>}
                                                            </div>
                                                            <input type="checkbox" checked={item.isVeg} onChange={(e) => handleItemChange(category.id, itemIndex, 'isVeg', e.target.checked)} className="hidden" />
                                                            <span className="text-sm font-medium text-gray-600 group-hover/check:text-gray-800">Veg</span>
                                                        </label>

                                                        <label className="flex items-center space-x-2 cursor-pointer group/check">
                                                            <input type="checkbox" checked={item.popular} onChange={(e) => handleItemChange(category.id, itemIndex, 'popular', e.target.checked)} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                                            <span className="text-sm text-gray-600 group-hover/check:text-gray-800">Popular</span>
                                                        </label>

                                                        <label className="flex items-center space-x-2 cursor-pointer group/check">
                                                            <input type="checkbox" checked={item.mustTry} onChange={(e) => handleItemChange(category.id, itemIndex, 'mustTry', e.target.checked)} className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500" />
                                                            <span className="text-sm text-gray-600 group-hover/check:text-gray-800">Must Try</span>
                                                        </label>

                                                        <label className="flex items-center space-x-2 cursor-pointer group/check">
                                                            <input type="checkbox" checked={item.isNew} onChange={(e) => handleItemChange(category.id, itemIndex, 'isNew', e.target.checked)} className="rounded border-gray-300 text-blue-500 focus:ring-blue-500" />
                                                            <span className="text-sm text-gray-600 group-hover/check:text-gray-800">New</span>
                                                        </label>

                                                        <div className="flex items-center ml-auto">
                                                            <div className="bg-gray-100 rounded-lg px-2 py-1 flex items-center border border-gray-200 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
                                                                <Percent className="h-3 w-3 text-gray-400 mr-2" />
                                                                <input
                                                                    type="number"
                                                                    value={item.gst_percent ?? 5}
                                                                    onChange={(e) => handleItemChange(category.id, itemIndex, 'gst_percent', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                                                    onBlur={() => handlePriceBlur(category.id, itemIndex, -1, 'gst_percent')}
                                                                    className="w-8 bg-transparent text-sm border-none focus:ring-0 p-0 text-right font-medium text-gray-700"
                                                                />
                                                                <span className="text-xs text-gray-500 ml-1">GST</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addNewItem(category.id)}
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-green-600 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200 flex flex-col items-center justify-center gap-2 group"
                                    >
                                        <PlusCircle className="h-8 w-8 group-hover:scale-110 transition-transform" />
                                        <span className="font-semibold">Add New Item to {category.title}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                {...confirmationModalProps}
            />
            <ImageUrlModal
                isOpen={isImageUrlModalOpen}
                onClose={() => setIsImageUrlModalOpen(false)}
                onSave={handleImageUrlSave}
            />
            <BulkMenuUploadModal
                isOpen={isBulkUploadModalOpen}
                onClose={() => setIsBulkUploadModalOpen(false)}
                onUpload={handleBulkData}
            />

            {renderContent()}

            <a
                href="tel:+917979057085"
                className="fixed bottom-8 right-8 z-30 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-3"
            >
                <Phone className="h-5 w-5" />
                <span className="text-sm font-semibold hidden sm:inline">Need help? Call Us</span>
            </a>
        </div>
    );
};

export default EditMenuPage;
