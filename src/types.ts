/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ContactStatus = 'Active' | 'Lead' | 'In Progress' | 'Inactive';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: ContactStatus;
  lastContact: string;
  avatar?: string;
}

export type DealStage = 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Deal {
  id: string;
  title: string;
  contactId: string;
  company: string;
  value: number;
  stage: DealStage;
  expectedClose: string;
}

export interface Activity {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Task';
  title: string;
  timestamp: string;
  contactId?: string;
  done: boolean;
}

export interface SellerPerformance {
  name: string;
  sales: number;
  deals: number;
}

export interface DashboardStats {
  totalContacts: number;
  activeDeals: number;
  totalRevenue: number;
  newLeads: number;
}

// === NEW WEB DEV LEARNING & MARKETPLACE HUB TYPES ===

export interface TutorialVideo {
  id: string;
  title: string;
  provider: 'YouTube' | 'Aparat' | 'Faradars';
  duration: string;
  level: 'مقدماتی' | 'متوسط' | 'پیشرفته';
  url: string;
  tags: string[];
  thumbnailColor: string;
  rating: number;
}

export interface ProjectTemplate {
  id: string;
  title: string;
  seller: string;
  price: number;
  githubUrl: string;
  deploymentUrl: string;
  techStack: string[];
  description: string;
  rating: number;
  salesCount: number;
  imageColor: string;
}

export interface ConnectedApp {
  id: string;
  projectName: string;
  githubUrl: string;
  subdomain: string; // e.g. project.kianhub.workers.dev
  cloudflareStatus: 'مستقر شده' | 'در حال ساخت' | 'متوقف شده';
  lastDeploy: string;
}
