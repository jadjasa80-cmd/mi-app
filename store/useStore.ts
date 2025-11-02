import { create } from 'zustand';

interface Pillar {
  id: string;
  name: string;
  color: string;
  icon: string;
  fields: any[];
  created_at: string;
  updated_at: string;
}

interface Weekly {
  id: string;
  week_start: string;
  week_end: string;
  pillar_reviews: any[];
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface CalendarEvent {
  id: string;
  task_id?: string;
  title: string;
  start: string;
  end: string;
  pillar_id?: string;
  completed: boolean;
  created_at: string;
}

interface Proposal {
  id: string;
  text: string;
  pillar_id?: string;
  archived: boolean;
  created_at: string;
}

interface RestrictedApp {
  id: string;
  name: string;
  icon: string;
  price: number;
  duration: number;
  daily_limit?: number;
  cooldown?: number;
}

interface AppSession {
  id: string;
  app_id: string;
  start_time: string;
  end_time: string;
  active: boolean;
}

interface MotivationalPhrase {
  id: string;
  text: string;
  created_at: string;
}

interface Store {
  pillars: Pillar[];
  weeklies: Weekly[];
  currentWeekly: Weekly | null;
  events: CalendarEvent[];
  proposals: Proposal[];
  creditBalance: number;
  restrictedApps: RestrictedApp[];
  activeSessions: AppSession[];
  phrases: MotivationalPhrase[];
  
  // Actions
  setPillars: (pillars: Pillar[]) => void;
  addPillar: (pillar: Pillar) => void;
  updatePillar: (id: string, pillar: Partial<Pillar>) => void;
  deletePillar: (id: string) => void;
  
  setWeeklies: (weeklies: Weekly[]) => void;
  setCurrentWeekly: (weekly: Weekly | null) => void;
  
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposal: (id: string, proposal: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  
  setCreditBalance: (balance: number) => void;
  setRestrictedApps: (apps: RestrictedApp[]) => void;
  setActiveSessions: (sessions: AppSession[]) => void;
  setPhrases: (phrases: MotivationalPhrase[]) => void;
}

export const useStore = create<Store>((set) => ({
  pillars: [],
  weeklies: [],
  currentWeekly: null,
  events: [],
  proposals: [],
  creditBalance: 0,
  restrictedApps: [],
  activeSessions: [],
  phrases: [],
  
  setPillars: (pillars) => set({ pillars }),
  addPillar: (pillar) => set((state) => ({ pillars: [...state.pillars, pillar] })),
  updatePillar: (id, pillar) => set((state) => ({
    pillars: state.pillars.map((p) => (p.id === id ? { ...p, ...pillar } : p)),
  })),
  deletePillar: (id) => set((state) => ({
    pillars: state.pillars.filter((p) => p.id !== id),
  })),
  
  setWeeklies: (weeklies) => set({ weeklies }),
  setCurrentWeekly: (weekly) => set({ currentWeekly: weekly }),
  
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, event) => set((state) => ({
    events: state.events.map((e) => (e.id === id ? { ...e, ...event } : e)),
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter((e) => e.id !== id),
  })),
  
  setProposals: (proposals) => set({ proposals }),
  addProposal: (proposal) => set((state) => ({ proposals: [...state.proposals, proposal] })),
  updateProposal: (id, proposal) => set((state) => ({
    proposals: state.proposals.map((p) => (p.id === id ? { ...p, ...proposal } : p)),
  })),
  deleteProposal: (id) => set((state) => ({
    proposals: state.proposals.filter((p) => p.id !== id),
  })),
  
  setCreditBalance: (balance) => set({ creditBalance: balance }),
  setRestrictedApps: (apps) => set({ restrictedApps: apps }),
  setActiveSessions: (sessions) => set({ activeSessions: sessions }),
  setPhrases: (phrases) => set({ phrases }),
}));