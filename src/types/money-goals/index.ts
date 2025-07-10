/**
 * Types for money goal functionality
 */

export interface MoneyGoalCategory {
  id: string;
  name: string;
  nameFr: string | null;
  nameMg: string | null;
  description: string | null;
  color: string | null;
  icon: string | null;
  isEnabled: boolean;
  goals?: MoneyGoal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MoneyGoal {
  id: string;
  name: string;
  amountGoal: number;
  years: number;
  status: string;
  categoryId: string;
  category: MoneyGoalCategory;
  createdBy: string;
  creator: {
    id: string;
    name: string | null;
    email: string | null;
  };
  contributions: MoneyGoalContribution[];
  editHistory: EditHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MoneyGoalContribution {
  id: string;
  goalId: string;
  amount: number;
  contributedBy: string;
  contributor: {
    id: string;
    name: string | null;
    email: string | null;
  };
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditHistoryEntry {
  timestamp: string;
  editedBy: string;
  editorName: string;
  changes: {
    field: string;
    previousValue: unknown;
    newValue: unknown;
  }[];
}

export interface MoneyGoalWithStats extends MoneyGoal {
  totalContributions: number;
  reachedGoal: number;
  progressPercentage: number;
  remainingAmount: number;
}

export interface CreateMoneyGoalRequest {
  name: string;
  amountGoal: number;
  years: number;
  categoryId: string;
}

export interface UpdateMoneyGoalRequest {
  id: string;
  name?: string;
  amountGoal?: number;
  years?: number;
  status?: string;
  categoryId?: string;
}

export interface MoneyGoalFilters {
  years?: number;
  status?: string;
  search?: string;
  categoryId?: string;
}

// Category-related types
export interface CreateMoneyGoalCategoryRequest {
  name: string;
  nameFr?: string;
  nameMg?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateMoneyGoalCategoryRequest {
  id: string;
  name?: string;
  nameFr?: string;
  nameMg?: string;
  description?: string;
  color?: string;
  icon?: string;
  isEnabled?: boolean;
}

export interface MoneyGoalSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalReachedAmount: number;
  overallProgress: number;
}

export interface MoneyGoalExportData {
  goals: MoneyGoalWithStats[];
  summary: MoneyGoalSummary;
  filters: MoneyGoalFilters;
  exportDate: string;
}
