// compact: smaller spinner without the tall page height, for widgets inside a page
export default function PageLoader({ text = "Loading...", compact = false }) {
    const size = compact ? "size-8" : "size-12";

    return (
        <div className={`flex flex-col items-center justify-center ${compact ? "py-6" : "min-h-[60vh]"}`}>
            {/* Spinner */}
            <div className="relative">
                <div className={`${size} rounded-full border-4 border-subtle`}></div>
                <div className={`absolute inset-0 ${size} animate-spin rounded-full border-4 border-transparent border-t-accent`}></div>
            </div>

            {/* Optional text */}
            {text && <p className="mt-4 text-sm text-muted">{text}</p>}
        </div>
    );
}
