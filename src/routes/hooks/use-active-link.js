import { useLocation, matchPath } from 'react-router-dom';
import { paths } from '../paths';

// ----------------------------------------------------------------------

export function useActiveLink(path, options = {}) {
  const { exact = false, includeHash = true } = options;
  const { pathname, hash } = useLocation();
  
  // Normalize paths for comparison
  const currentPath = pathname + (includeHash ? hash : '');
  
  // Handle exact matches
  if (exact) {
    return path === currentPath;
  }
  
  // Special handling for admin dashboard
  if (path === paths.admin.dashboard) {
    return pathname === paths.admin.dashboard || pathname === paths.admin.root;
  }
  
  // Default deep matching
  return path ? !!matchPath({ path, end: false }, pathname) : false;
}
