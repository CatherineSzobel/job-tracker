export default function PageLoader({ text = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] transition-colors">
            {/* Spinner */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-light-muted dark:border-dark-muted"></div>
                <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-t-accent border-transparent animate-spin"></div>
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