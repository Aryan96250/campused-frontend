import { Injectable } from '@angular/core';

interface CachedFile {
  blob: Blob;
  objectUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileCacheService {
  private cache = new Map<string, CachedFile>();
  private readonly MAX_CACHE_SIZE = 50; 

  constructor() {
    // Cache only clears on logout or 401 error
    // No automatic cleanup or expiry
  }


  get(key: string): string | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    return cached.objectUrl;
  }


  set(key: string, blob: Blob): string {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.removeOldestEntry();
    }

    const objectUrl = URL.createObjectURL(blob);
    
    this.cache.set(key, {
      blob,
      objectUrl
    });

    return objectUrl;
  }


  has(key: string): boolean {
    return this.cache.has(key);
  }

  remove(key: string): void {
    const cached = this.cache.get(key);
    if (cached) {
      URL.revokeObjectURL(cached.objectUrl);
      this.cache.delete(key);
    }
  }


  clear(): void {
    this.cache.forEach(cached => {
      URL.revokeObjectURL(cached.objectUrl);
    });
    this.cache.clear();
  }


  private removeOldestEntry(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.remove(firstKey);
    }
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}