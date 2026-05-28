'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Re-export matching types for the frontend
export interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  city: string;
  ownership: string;
  nirfRank: number | null;
  fees: number;
  rating: number;
  description: string;
  established: number;
  logoUrl: string;
  bannerUrl: string;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
  accreditation: string | null;
  website: string | null;
  exams: string[];
  facilities: string[];
  collegeIntelligenceScore: number;
  roiScore: number;
  scholarshipFriendly: boolean;
  trending: boolean;
  syncSource?: string;
  syncLastUpdated?: string;
  syncConfidenceScore?: number;
  syncMissingFields?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

interface SavedSearch {
  id: string;
  query: string;
  filters: any;
  timestamp: string;
}

interface AppContextType {
  user: User | null;
  loadingUser: boolean;
  isFallbackMode: boolean;
  comparisonColleges: College[];
  savedCollegeIds: string[];
  recentlyViewedIds: string[];
  savedSearches: SavedSearch[];
  addToComparison: (college: College) => boolean; // returns true if added, false if full
  removeFromComparison: (collegeId: string) => void;
  clearComparison: () => void;
  toggleSaveCollege: (collegeId: string) => Promise<boolean>;
  checkUserSession: () => Promise<void>;
  addRecentlyViewed: (collegeId: string) => void;
  saveSearch: (query: string, filters: any) => void;
  deleteSavedSearch: (id: string) => void;
  setUser: (user: User | null) => void;
  setIsFallbackMode: (val: boolean) => void;
  setComparisonColleges: (colleges: College[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [comparisonColleges, setComparisonColleges] = useState<College[]>([]);
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  // Load user session on mount
  const checkUserSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Load saved colleges if logged in
        const savedRes = await fetch('/api/saved-colleges');
        const savedData = await savedRes.json();
        if (savedData.savedColleges) {
          setSavedCollegeIds(savedData.savedColleges.map((c: any) => c.id));
          if (savedData.isFallback) setIsFallbackMode(true);
        }
      } else {
        setUser(null);
        setSavedCollegeIds([]);
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkUserSession();
    
    // Load comparisons from localStorage if present
    try {
      const storedComps = localStorage.getItem('college_comparisons');
      if (storedComps) {
        const parsed = JSON.parse(storedComps);
        if (Array.isArray(parsed)) {
          setComparisonColleges(parsed);
        } else {
          localStorage.removeItem('college_comparisons');
        }
      }
    } catch (e) {
      console.error('Failed to load comparisons:', e);
      try { localStorage.removeItem('college_comparisons'); } catch (err) {}
    }
    
    // Load recently viewed
    try {
      const storedViewed = localStorage.getItem('recently_viewed_colleges');
      if (storedViewed) {
        const parsed = JSON.parse(storedViewed);
        if (Array.isArray(parsed)) {
          setRecentlyViewedIds(parsed);
        } else {
          localStorage.removeItem('recently_viewed_colleges');
        }
      }
    } catch (e) {
      console.error('Failed to load recently viewed:', e);
      try { localStorage.removeItem('recently_viewed_colleges'); } catch (err) {}
    }

    // Load saved searches
    try {
      const storedSearches = localStorage.getItem('saved_searches');
      if (storedSearches) {
        const parsed = JSON.parse(storedSearches);
        if (Array.isArray(parsed)) {
          setSavedSearches(parsed);
        } else {
          localStorage.removeItem('saved_searches');
        }
      }
    } catch (e) {
      console.error('Failed to load saved searches:', e);
      try { localStorage.removeItem('saved_searches'); } catch (err) {}
    }
  }, []);

  const addToComparison = (college: College): boolean => {
    // Max 3 colleges
    if (comparisonColleges.some(c => c.id === college.id)) return true;
    if (comparisonColleges.length >= 3) {
      return false;
    }
    const updated = [...comparisonColleges, college];
    setComparisonColleges(updated);
    try {
      localStorage.setItem('college_comparisons', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save comparison to localStorage:', e);
    }
    return true;
  };

  const removeFromComparison = (collegeId: string) => {
    const updated = comparisonColleges.filter(c => c.id !== collegeId);
    setComparisonColleges(updated);
    try {
      localStorage.setItem('college_comparisons', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save comparison to localStorage:', e);
    }
  };

  const clearComparison = () => {
    setComparisonColleges([]);
    try {
      localStorage.removeItem('college_comparisons');
    } catch (e) {
      console.error('Failed to remove comparison from localStorage:', e);
    }
  };

  const toggleSaveCollege = async (collegeId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/saved-colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.saved) {
          setSavedCollegeIds(prev => [...prev, collegeId]);
        } else {
          setSavedCollegeIds(prev => prev.filter(id => id !== collegeId));
        }
        if (data.isFallback) setIsFallbackMode(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const addRecentlyViewed = (collegeId: string) => {
    setRecentlyViewedIds(prev => {
      // Remove duplicate if already present and prepend to front
      const filtered = prev.filter(id => id !== collegeId);
      const updated = [collegeId, ...filtered].slice(0, 8); // Keep last 8 viewed
      try {
        localStorage.setItem('recently_viewed_colleges', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recently viewed to localStorage:', e);
      }
      return updated;
    });
  };

  const saveSearch = (query: string, filters: any) => {
    setSavedSearches(prev => {
      // Avoid duplicate queries with same filters
      const hasDuplicate = prev.some(s => s.query.toLowerCase() === query.toLowerCase() && JSON.stringify(s.filters) === JSON.stringify(filters));
      if (hasDuplicate) return prev;
      
      const newSearch: SavedSearch = {
        id: 'search-' + Date.now(),
        query,
        filters,
        timestamp: new Date().toISOString()
      };
      const updated = [newSearch, ...prev].slice(0, 10); // Keep last 10
      try {
        localStorage.setItem('saved_searches', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save search to localStorage:', e);
      }
      return updated;
    });
  };

  const deleteSavedSearch = (id: string) => {
    setSavedSearches(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('saved_searches', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save search to localStorage:', e);
      }
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        isFallbackMode,
        comparisonColleges,
        savedCollegeIds,
        recentlyViewedIds,
        savedSearches,
        addToComparison,
        removeFromComparison,
        clearComparison,
        toggleSaveCollege,
        checkUserSession,
        addRecentlyViewed,
        saveSearch,
        deleteSavedSearch,
        setUser,
        setIsFallbackMode,
        setComparisonColleges,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
