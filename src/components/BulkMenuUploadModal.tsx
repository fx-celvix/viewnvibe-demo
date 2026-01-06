
import React, { useState } from 'react';
import { utils, read, writeFile } from 'xlsx';
import { Upload, Download, FileSpreadsheet, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface BulkMenuUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (data: any[]) => void;
}

export const BulkMenuUploadModal: React.FC<BulkMenuUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [isThinking, setIsThinking] = useState(false);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                Category: 'Starters',
                Name: 'Chicken Tikka',
                Description: 'Spicy and tangy chicken chunks',
                Price: 250,
                Veg: 'No',
                ImageURL: 'https://example.com/image.webp',
                GST: 5
            },
            {
                Category: 'Main Course',
                Name: 'Paneer Butter Masala',
                Description: 'Creamy paneer curry',
                Price: 200,
                Veg: 'Yes',
                ImageURL: 'https://example.com/paneer.webp',
                GST: 5
            }
        ];
        const ws = utils.json_to_sheet(templateData);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Template");
        writeFile(wb, "Menu_Upload_Template.xlsx");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsThinking(true);
        setError('');

        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
                setError("The uploaded file is empty or invalid.");
                setIsThinking(false);
                return;
            }

            processData(jsonData);
        } catch (err) {
            console.error("Error parsing Excel:", err);
            setError("Failed to parse the file. Please ensure it is a valid Excel file matching the template.");
            setIsThinking(false);
        }
    };

    const processData = (rawData: any[]) => {
        // Group by Category
        const categoriesMap = new Map();

        rawData.forEach((row: any) => {
            const categoryName = row['Category'] || 'Uncategorized';

            if (!categoriesMap.has(categoryName)) {
                categoriesMap.set(categoryName, {
                    id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: categoryName,
                    items: []
                });
            }

            const category = categoriesMap.get(categoryName);

            // Parse Prices
            // Assuming simplified single price for bulk upload for now, or use logic to parse multiple columns if needed.
            // Keeping it simple: One price column -> one price option.
            const prices = [];
            if (row['Price']) {
                prices.push({ label: 'Price', price: parseFloat(row['Price']) || 0 });
            }


            // Create Item
            const newItem = {
                name: row['Name'] || 'New Item',
                description: row['Description'] || '',
                prices: prices.length > 0 ? prices : [{ label: 'Price', price: 0 }],

                imageUrl: row['ImageURL'] || 'https://placehold.co/150x150.webp',
                imageHint: row['Name'] || 'food item',
                isVeg: (row['Veg'] && String(row['Veg']).toLowerCase() === 'yes') || false,
                isNew: false,
                popular: false,
                mustTry: false,
                gst_percent: parseFloat(row['GST']) || 5
            };

            category.items.push(newItem);
        });

        const distinctCategories = Array.from(categoriesMap.values());
        onUpload(distinctCategories);
        onClose();
        setIsThinking(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-100 p-2 rounded-full">
                            <FileSpreadsheet className="text-senoa-green h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Bulk Menu Upload</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                            <AlertCircle className="text-blue-600 h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 text-sm">Use the Template</h3>
                                <p className="text-blue-700 text-xs mt-1">
                                    Please use our official Excel template to ensure your data is formatted correctly.
                                </p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <Download size={14} />
                                    Download Template
                                </button>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-500 hover:bg-green-50/30 transition-all group">
                            <input
                                type="file"
                                id="excel-upload"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isThinking}
                            />
                            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                {isThinking ? (
                                    <Loader2 className="h-10 w-10 text-senoa-green animate-spin mb-3" />
                                ) : (
                                    <Upload className="h-10 w-10 text-gray-400 group-hover:text-senoa-green transition-colors mb-3" />
                                )}
                                <span className="text-sm font-semibold text-gray-700">
                                    {isThinking ? 'Processing...' : (fileName || 'Click to upload Excel file')}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {isThinking ? 'Please wait' : 'Supports .xlsx, .xls'}
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-b-lg border-t text-center text-xs text-gray-500">
                    Existing categories with the same name will be merged.
                </div>
            </div>
        </div>
    );
};
