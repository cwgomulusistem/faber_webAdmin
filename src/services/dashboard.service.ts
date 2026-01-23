// Dashboard API Service
import api from './api.service';
import type {
  DashboardLayout,
  DashboardWidget,
  CreateWidgetInput,
  UpdateWidgetInput,
  BatchUpdateLayoutInput,
} from '@/types/dashboard.types';

// Get user's dashboard
export const getDashboard = async (): Promise<DashboardLayout> => {
  const response = await api.get<{ success: boolean; data: DashboardLayout }>('/dashboard');
  return response.data.data;
};

// Add a new widget
export const addWidget = async (input: CreateWidgetInput): Promise<DashboardWidget> => {
  const response = await api.post<{ success: boolean; data: DashboardWidget }>('/dashboard/widgets', input);
  return response.data.data;
};

// Update a widget
export const updateWidget = async (widgetId: string, input: UpdateWidgetInput): Promise<DashboardWidget> => {
  const response = await api.put<{ success: boolean; data: DashboardWidget }>(`/dashboard/widgets/${widgetId}`, input);
  return response.data.data;
};

// Delete a widget
export const deleteWidget = async (widgetId: string): Promise<void> => {
  await api.delete(`/dashboard/widgets/${widgetId}`);
};

// Batch update layouts (after drag-drop)
export const batchUpdateLayouts = async (dashboardId: string, input: BatchUpdateLayoutInput): Promise<void> => {
  await api.put(`/dashboard/${dashboardId}/layouts`, input);
};

export const dashboardService = {
  getDashboard,
  addWidget,
  updateWidget,
  deleteWidget,
  batchUpdateLayouts,
};

export default dashboardService;
