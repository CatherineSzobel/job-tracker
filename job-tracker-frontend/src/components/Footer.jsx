export default function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-900 text-center py-4 mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Job Tracker. All rights reserved.
            </p>
        </footer>
    );
}
