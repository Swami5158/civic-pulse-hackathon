export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  lat: number;
  lng: number;
  phone: string;
  photo_url?: string;
  sentiment?: string;
  language?: string;
  resolution_time_est?: number;
  ward_id: string;
  created_at: string;
  updated_at: string;
  updates?: IssueUpdate[];
}

export interface IssueUpdate {
  id: number;
  issue_id: string;
  status: string;
  comment: string;
  officer_name?: string;
  created_at: string;
}

export interface DashboardStats {
  total: number;
  resolved: number;
  critical: number;
  open: number;
  categories: { category: string; count: number }[];
  wards: { ward_id: string; count: number }[];
  recent: Issue[];
}

export interface CrisisCluster {
  center: { lat: number; lng: number };
  count: number;
  category: string;
  issues: Issue[];
}
