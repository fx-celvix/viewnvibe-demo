
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
            imageUrl: 'https://placehold.co/150x150.png',
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

                            <button onClick={confirmSaveChanges} className="w-1/3 sm:w-auto flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-senoa-green text-white hover:bg-senoa-green-dark transition-colors">
                                <Save className="h-4 w-4" />
                                <span className="hidden md:inline">Save All</span>
                                <span className="md:hidden">Save</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {menuData.map(category => (
                        <div key={category.id} className="bg-white rounded-lg shadow-sm border">
                            <div className="p-4 flex justify-between items-center">
                                <input
                                    type="text"
                                    value={category.title}
                                    onChange={(e) => handleCategoryTitleChange(category.id, e.target.value)}
                                    className="text-lg font-bold border-b-2 border-transparent focus:border-green-500 outline-none w-full bg-transparent"
                                />
                                <div className="flex items-center">
                                    <button onClick={() => confirmRemoveCategory(category.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleCategoryToggle(category.id)} className="p-1.5">
                                        {openCategories[category.id] ? <ChevronUp /> : <ChevronDown />}
                                    </button>
                                </div>
                            </div>

                            {openCategories[category.id] && (
                                <div className="p-4 border-t space-y-4">
                                    {category.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="p-4 border rounded-lg flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start bg-gray-50/50 relative">
                                            <GripVertical className="h-5 w-5 text-gray-400 mt-2 cursor-grab hidden sm:block" />
                                            <div className="relative w-full sm:w-24 h-auto sm:h-24 flex-shrink-0">
                                                <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-md object-cover w-full sm:w-24 h-auto sm:h-24" />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity rounded-md space-x-2">
                                                    <label htmlFor={`image-upload-${category.id}-${itemIndex}`} className="cursor-pointer p-2 rounded-full hover:bg-black/50">
                                                        <ImageIcon className="h-5 w-5" />
                                                    </label>
                                                    <button onClick={() => openImageUrlModal(category.id, itemIndex)} className="cursor-pointer p-2 rounded-full hover:bg-black/50">
                                                        <LinkIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                <input
                                                    id={`image-upload-${category.id}-${itemIndex}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(e, category.id, itemIndex)}
                                                />
                                            </div>
                                            <div className="flex-grow space-y-3 w-full">
                                                <input type="text" value={item.name} onChange={(e) => handleItemChange(category.id, itemIndex, 'name', e.target.value)} className="w-full border-b text-md font-semibold pb-1 outline-none focus:border-green-500 bg-transparent" />
                                                <textarea value={item.description} onChange={(e) => handleItemChange(category.id, itemIndex, 'description', e.target.value)} className="w-full border rounded-md p-2 text-xs h-20 outline-none focus:ring-1 focus:ring-green-500 bg-transparent" />

                                                <div className="space-y-2">
                                                    {item.prices.map((price, priceIndex) => (
                                                        <div key={priceIndex} className="flex items-center space-x-2">
                                                            <BookOpen className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                            <input type="text" placeholder="Label (e.g., Full)" value={price.label} onChange={(e) => handlePriceChange(category.id, itemIndex, priceIndex, 'label', e.target.value)} className="w-24 border-b text-sm outline-none focus:border-green-500 bg-transparent" />
                                                            <IndianRupee className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                            <input type="number" placeholder="Price" value={price.price} onChange={(e) => handlePriceChange(category.id, itemIndex, priceIndex, 'price', e.target.value)} onBlur={() => handlePriceBlur(category.id, itemIndex, priceIndex, 'price')} className="w-20 border-b text-sm outline-none focus:border-green-500 bg-transparent" />
                                                            <button onClick={() => removePriceOption(category.id, itemIndex, priceIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><Minus size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addPriceOption(category.id, itemIndex)} className="text-blue-500 text-xs font-semibold flex items-center space-x-1"><Plus size={14} /><span>Add Price</span></button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                                                    <label className="flex items-center text-xs"><input type="checkbox" checked={item.isVeg} onChange={(e) => handleItemChange(category.id, itemIndex, 'isVeg', e.target.checked)} className="mr-1 accent-green-600" /> Veg</label>
                                                    <label className="flex items-center text-xs"><input type="checkbox" checked={item.popular} onChange={(e) => handleItemChange(category.id, itemIndex, 'popular', e.target.checked)} className="mr-1 accent-orange-500" /> Popular</label>
                                                    <label className="flex items-center text-xs"><input type="checkbox" checked={item.mustTry} onChange={(e) => handleItemChange(category.id, itemIndex, 'mustTry', e.target.checked)} className="mr-1 accent-yellow-500" /> Must Try</label>
                                                    <label className="flex items-center text-xs"><input type="checkbox" checked={item.isNew} onChange={(e) => handleItemChange(category.id, itemIndex, 'isNew', e.target.checked)} className="mr-1 accent-blue-500" /> New</label>
                                                    <label className="flex items-center text-xs">
                                                        <Percent className="h-3 w-3 mr-1 text-gray-500" />
                                                        <input
                                                            type="number"
                                                            value={item.gst_percent ?? 5}
                                                            onChange={(e) => handleItemChange(category.id, itemIndex, 'gst_percent', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                                                            onBlur={() => handlePriceBlur(category.id, itemIndex, -1, 'gst_percent')}
                                                            className="w-12 border-b text-xs outline-none focus:border-green-500 bg-transparent"
                                                        />
                                                        GST
                                                    </label>
                                                </div>
                                            </div>
                                            <button onClick={() => removeItem(category.id, itemIndex)} className="text-red-500 hover:text-red-700 p-1 rounded-full absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto sm:self-start">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => addNewItem(category.id)} className="w-full flex items-center justify-center space-x-2 text-sm font-semibold p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors mt-4">
                                        <PlusCircle className="h-4 w-4" />
                                        <span>Add New Item to {category.title}</span>
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
