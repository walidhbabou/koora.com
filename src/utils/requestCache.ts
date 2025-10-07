// Request cache and debouncing utility to prevent duplicate API calls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();
  private readonly DEFAULT_EXPIRY = 30000; // 30 seconds

  // Generate cache key from request parameters
  private generateKey(baseKey: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');
    return `${baseKey}?${sortedParams}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<unknown>): boolean {
    return Date.now() < entry.timestamp + entry.expiry;
  }

  // Get from cache or execute request
  async getOrExecute<T>(
    key: string, 
    params: Record<string, unknown>, 
    executor: () => Promise<T>,
    expiry: number = this.DEFAULT_EXPIRY
  ): Promise<T> {
    const cacheKey = this.generateKey(key, params);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValid(cached)) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached.data as T;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`Request already pending for ${cacheKey}`);
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Execute new request
    console.log(`Executing new request for ${cacheKey}`);
    const requestPromise = executor()
      .then(data => {
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          expiry
        });
        return data;
      })
      .finally(() => {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  // Clear cache for specific key pattern
  clearCache(keyPattern?: string): void {
    if (keyPattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(keyPattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Clear expired entries
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global instance
export const requestCache = new RequestCache();

// Debounce function for preventing rapid successive calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}