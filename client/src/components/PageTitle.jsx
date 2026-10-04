import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitleContext = createContext(null);

// Holds the TopNav title. A title only applies to the path that set it,
// so navigating away falls back to the shell's nav-derived default.
export function PageTitleProvider({ children }) {
  const [entry, setEntry] = useState({ path: null, title: '' });
  return <PageTitleContext.Provider value={{ entry, setEntry }}>{children}</PageTitleContext.Provider>;
}

// Call from a page: usePageTitle('Discover'). Also sets document.title.
export function usePageTitle(title) {
  const ctx = useContext(PageTitleContext);
  const { pathname } = useLocation();
  const setEntry = ctx?.setEntry;
  useEffect(() => {
    if (!title) return;
    document.title = `${title} · Learnly`;
    setEntry?.({ path: pathname, title });
  }, [title, pathname, setEntry]);
}

// Used by TopNav: the page-set title for the current path, else `fallback`.
export function useCurrentPageTitle(fallback) {
  const ctx = useContext(PageTitleContext);
  const { pathname } = useLocation();
  return ctx?.entry.path === pathname && ctx.entry.title ? ctx.entry.title : fallback;
}
