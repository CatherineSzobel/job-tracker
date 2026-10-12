import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

const MenuContext = createContext({ close: () => {} });

const ITEM_CLASSES = "flex w-full min-h-10 items-center gap-3 rounded-lg px-3 text-left transition-colors hover:bg-soft focus-visible:bg-soft";

const menuItems = (list) => [...list.querySelectorAll('[role="menuitem"]')];

// A button that opens a floating menu of MenuItem / MenuDivider children (DESIGN_E.md §5 "Menu").
// Closes on outside click, Escape (focus goes back to the button), Tab and after picking an item.
// Arrow keys, Home and End move between items. buttonContent: what the button shows; label: its
// accessible name, only needed when buttonContent is just an icon. align: which edge of the button the menu lines up with.
export default function Menu({ label, buttonContent, buttonClassName = "btn-icon", align = "right", width = "w-56", children }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const id = useId();
  const buttonId = `${id}-button`;
  const listId = `${id}-menu`;

  useEffect(() => {
    if (!open) return;

    menuItems(listRef.current)[0]?.focus();

    const handleClickOutside = (event) => {
      if (!wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const close = ({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close({ restoreFocus: true });
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }

    const items = menuItems(listRef.current);
    const currentIndex = items.indexOf(document.activeElement);
    const nextIndex = {
      ArrowDown: (currentIndex + 1) % items.length,
      ArrowUp: (currentIndex - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    items[nextIndex]?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}
        className={buttonClassName}
      >
        {buttonContent}
      </button>

      {open && (
        <MenuContext.Provider value={{ close }}>
          <ul
            ref={listRef}
            id={listId}
            role="menu"
            aria-labelledby={buttonId}
            onKeyDown={handleKeyDown}
            className={`absolute top-full z-30 mt-2 ${align === "right" ? "right-0" : "left-0"} ${width} rounded-xl border border-line bg-surface p-2 text-ink shadow-menu`}
          >
            {children}
          </ul>
        </MenuContext.Provider>
      )}
    </div>
  );
}

// One menu entry: a link (to) or an action (onClick). danger: red text, for Delete and Log out (put it last).
export function MenuItem({ to, onClick, icon, danger = false, children }) {
  const { close } = useContext(MenuContext);
  const Icon = icon;
  const classes = `${ITEM_CLASSES} ${danger ? "font-semibold text-danger" : "text-ink"}`;
  const content = (
    <>
      {Icon && <Icon size={16} aria-hidden="true" />}
      {children}
    </>
  );

  const pick = () => {
    close();
    onClick?.();
  };

  return (
    <li role="none">
      {to ? (
        <Link role="menuitem" to={to} onClick={pick} className={classes}>
          {content}
        </Link>
      ) : (
        <button role="menuitem" type="button" onClick={pick} className={classes}>
          {content}
        </button>
      )}
    </li>
  );
}

export function MenuDivider() {
  return <li role="separator" className="my-2 h-px bg-line" />;
}
