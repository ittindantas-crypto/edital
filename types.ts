export interface Review {
  date: string;
  total: number;
  hits: number;
  notes: string;
}

export interface Topic {
  id: string;
  text: string;
  seen: boolean;
  reviews: Review[];
  children?: Topic[];
  nextReview?: string;
}

export interface Subject {
  id: string;
  title: string;
  topics: Topic[];
}

export interface Category {
  id: string;
  title: string;
  subjects: Subject[];
}

export interface Edital {
  id: string;
  title: string;
  createdAt: string;
  categories: Category[];
}

export type ViewState = 'dashboard' | 'import' | 'study';

export interface AnalysisData {
  id: string;
  text: string;
  subject: string;
  category: string;
  reviews: number;
  percentage: number | null;
  seen: boolean;
}
