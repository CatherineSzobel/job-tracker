// compact: smaller spinner without the tall page height, for widgets inside a page
export default function PageLoader({ text = "Loading...", compact = false }) {
    const size = compact ? "w-8 h-8" : "w-12 h-12";

    return (
        <div className={`flex flex-col items-center justify-center transition-colors ${compact ? "py-6" : "min-h-[60vh]"}`}>
            {/* Spinner */}
            <div className="relative">
                <div className={`${size} rounded-full border-4 border-light-muted dark:border-dark-muted`}></div>
                <div className={`absolute inset-0 ${size} rounded-full border-4 border-t-accent border-transparent animate-spin`}></div>
            </div>

            {/* Optional text */}
            {text && (
                <p className="mt-4 text-sm text-light-muted dark:text-dark-muted tracking-wide">
                    {text}
                </p>
            )}
        </div>
    );
}
