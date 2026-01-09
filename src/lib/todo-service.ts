import { API_BASE_URL } from "./api-config";
import { getAccessToken } from "./auth-store";

export type TodoStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface TodoDto {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  created_timestamp: number;
}

export interface TodoPaginated {
  total_pages: number;
  current_page: number;
  total: number;
  has_next: boolean;
  has_previous: boolean;
  is_last: boolean;
  is_empty: boolean;
  contents: TodoDto[];
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  status?: TodoStatus;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
}

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
});

export const todoService = {
  getTodos: async (params: {
    status?: TodoStatus;
    search?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_dir?: string;
  } = {}): Promise<TodoPaginated> => {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/todos?${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },

  createTodo: async (todo: CreateTodoRequest): Promise<TodoDto> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error("Failed to create todo");
    return response.json();
  },

  updateTodo: async (id: string, todo: UpdateTodoRequest): Promise<TodoDto> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return response.json();
  },

  deleteTodo: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete todo");
  },
};
