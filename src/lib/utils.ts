import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conditional classes and deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get active home ID from localStorage
 * Handles both JSON-stringified values (from useLocalStorage hook) 
 * and plain strings (from direct localStorage.setItem calls)
 */
export function getActiveHomeId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const rawValue = window.localStorage.getItem('faber_active_home_id');
    if (!rawValue) return null;
    
    let value: string = rawValue;
    
    // Handle JSON-stringified strings: "\"uuid\"" -> "uuid"
    if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
      try {
        const parsed = JSON.parse(rawValue);
        if (typeof parsed === 'string') {
          value = parsed;
        } else {
          // Fallback: strip quotes manually
          value = rawValue.slice(1, -1);
        }
      } catch {
        // Fallback: strip quotes manually
        value = rawValue.slice(1, -1);
      }
    }
    
    return value || null;
  } catch {
    return null;
  }
}

/**
 * Set active home ID to localStorage (plain string, no JSON)
 */
export function setActiveHomeId(homeId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem('faber_active_home_id', homeId);
  } catch {
    // Ignore localStorage errors
  }
}
