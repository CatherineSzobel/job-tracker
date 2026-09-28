export default function Footer() {
    return (
        <footer className="bg-light-soft dark:bg-dark text-center py-4 mt-8">
            <p className="text-sm text-light-muted dark:text-dark-muted">
                &copy; {new Date().getFullYear()} Job Tracker. All rights reserved.
            </p>
        </footer>
    );
}
