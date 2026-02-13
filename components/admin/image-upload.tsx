'use client';

import { useState, useRef } from 'react';
import { UploadCloud02, Trash01, Image01 } from '@untitledui/icons';

type ImageUploadProps = {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
};

export default function ImageUpload({ value, onChange, label, className = '' }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            if (data.success && data.url) {
                onChange(data.url);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal mengupload gambar.');
        } finally {
            setIsUploading(false);
            // Reset input value to allow re-uploading the same file if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <p className="text-sm font-medium text-text-dark">{label}</p>}

            {value ? (
                <div className="relative h-32 w-48 overflow-hidden rounded-xl border border-primary/20 bg-neutral-light group">
                    <img
                        src={value}
                        alt="Uploaded preview"
                        className="h-full w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-error shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-error-dark"
                    >
                        <Trash01 className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex h-32 w-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/20 bg-neutral-light transition-colors hover:bg-primary/5 ${isUploading ? 'opacity-50 pointer-events-none' : ''
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-2 text-primary">
                        {isUploading ? (
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                            <UploadCloud02 className="h-8 w-8" />
                        )}
                        <p className="text-sm font-medium">
                            {isUploading ? 'Mengupload...' : 'Klik untuk upload gambar'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
