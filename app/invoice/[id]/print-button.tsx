'use client';

export default function PrintButton() {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
            <span className="material-icons-round text-base">print</span>
            Cetak Invoice
        </button>
    );
}
