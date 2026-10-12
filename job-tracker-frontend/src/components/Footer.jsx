import { Link } from "react-router-dom";

const LINK_CLASSES = "text-muted underline-offset-4 hover:text-ink hover:underline";

// links: [{ label, to }] for app pages or [{ label, href }] for other sites, shown beside the copyright line
// (landing page). Without links it's just the line, centred (log in / sign up).
export default function Footer({ links }) {
    const copyright = <p className="text-sm/6 text-muted">&copy; {new Date().getFullYear()} Job Tracker. All rights reserved.</p>;

    if (!links) {
        return <footer className="px-4 py-6 text-center">{copyright}</footer>;
    }

    return (
        <footer className="border-t border-line">
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-8">
                {copyright}
                <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm/6">
                    {links.map(({ label, to, href }) =>
                        to ? (
                            <Link key={label} to={to} className={LINK_CLASSES}>
                                {label}
                            </Link>
                        ) : (
                            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASSES}>
                                {label}
                            </a>
                        )
                    )}
                </nav>
            </div>
        </footer>
    );
}
