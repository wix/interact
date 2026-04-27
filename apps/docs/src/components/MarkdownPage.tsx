import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { getMarkdownPath } from '../config/navigation';

export function MarkdownPage() {
  const location = useLocation();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      setLoading(true);
      setError(null);

      const mdPath = getMarkdownPath(location.pathname);

      try {
        // Use the base URL + /docs endpoint which serves from packages/interact/docs
        // In dev (base=/): fetches /docs/README.md
        // In prod (base=/docs/): fetches /docs/docs/README.md
        const response = await fetch(`${import.meta.env.BASE_URL}docs/${mdPath}`);

        if (!response.ok) {
          throw new Error(`Failed to load: ${mdPath}`);
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error loading markdown:', err);
        setError(`Could not load documentation for: ${location.pathname}`);
      } finally {
        setLoading(false);
      }
    };

    loadMarkdown();
    // Scroll to top on navigation
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <span>Loading documentation...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Page Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <article className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom link handling for internal navigation
          a: ({ href, children, ...props }) => {
            // External links open in new tab
            if (href?.startsWith('http')) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              );
            }
            // Anchor links (hash only) - handle manually for HashRouter compatibility
            if (href?.startsWith('#')) {
              const handleAnchorClick = (e: React.MouseEvent) => {
                e.preventDefault();
                const targetId = href.slice(1);
                const element = document.getElementById(targetId);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              };
              return (
                <a href={href} onClick={handleAnchorClick} {...props}>
                  {children}
                </a>
              );
            }
            // Internal markdown links - convert to router paths
            if (
              href &&
              (href.endsWith('.md') ||
                href.startsWith('./') ||
                href.startsWith('../') ||
                href.startsWith('/') ||
                !href.includes('://'))
            ) {
              // Separate hash from path
              const [pathPart, hashPart] = href.split('#');

              // Build absolute path from current location
              let absolutePath = pathPart;
              if (pathPart && !pathPart.startsWith('/')) {
                // Relative path - resolve against current location
                // For index pages (like /api), treat them as directories
                const currentPath = location.pathname;
                const currentDir = currentPath.endsWith('/')
                  ? currentPath.slice(0, -1)
                  : currentPath; // Treat /api as directory /api for relative resolution
                absolutePath = `${currentDir}/${pathPart}`.replace(/\/+/g, '/');
              }

              // Clean up: remove .md extension and README, normalize path
              let cleanPath = (absolutePath || '')
                .replace(/\.md$/, '')
                .replace(/\/README$/i, '')
                .replace(/\/\.\//g, '/') // Remove ./
                .replace(/\/+/g, '/') // Remove duplicate slashes
                .replace(/^\/+/, '/'); // Ensure single leading slash

              // Handle ../ segments
              const segments = cleanPath.split('/').filter(Boolean);
              const resolved: string[] = [];
              for (const seg of segments) {
                if (seg === '..') {
                  resolved.pop();
                } else if (seg !== '.') {
                  resolved.push(seg);
                }
              }
              cleanPath = '/' + resolved.join('/');

              // Re-add hash if present
              const finalPath = hashPart ? `${cleanPath}#${hashPart}` : cleanPath;
              return (
                <Link to={finalPath || '/'} {...props}>
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} {...props}>
                {children}
              </a>
            );
          },
          // Add copy button to code blocks
          pre: ({ children, ...props }) => (
            <div className="code-block-wrapper">
              <pre {...props}>{children}</pre>
            </div>
          ),
          // Style tables nicely
          table: ({ children, ...props }) => (
            <div className="table-wrapper">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
