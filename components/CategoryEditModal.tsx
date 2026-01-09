import React, { useState } from 'react';

interface CategoryEditModalProps {
    categoryName: string;
    displayName?: string;
    onSave: (oldName: string, newName: string) => void;
    onClose: () => void;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
    categoryName,
    displayName,
    onSave,
    onClose
}) => {
    const [newName, setNewName] = useState(displayName || categoryName);

    const handleSave = () => {
        const trimmedName = newName.trim();
        if (trimmedName && trimmedName !== categoryName) {
            onSave(categoryName, trimmedName);
        }
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <h3 className="text-2xl font-bold serif mb-2">
                        ✏️ Đổi tên danh mục
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                        Thay đổi tên hiển thị của danh mục "<strong>{categoryName}</strong>"
                    </p>

                    <input
                        type="text"
                        className="w-full border-2 border-neutral-200 rounded-2xl px-5 py-4 text-base font-semibold mb-6 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                        placeholder="Nhập tên mới..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-neutral-100 text-neutral-600 px-6 py-4 rounded-2xl text-sm font-bold hover:bg-neutral-200 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-gradient-pink text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-xl hover-glow-pink transition-all"
                        >
                            💾 Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryEditModal;
