import { useEffect, useState, useCallback } from "react";
import { getAccessToken, logout } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  ShieldCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ListTodo,
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  LayoutGrid,
  Columns
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { todoService } from "@/lib/todo-service";
import type { TodoDto, TodoPaginated, CreateTodoRequest, UpdateTodoRequest, TodoStatus } from "@/lib/todo-service";
import { TodoCard } from "@/components/todo-card";
import { TodoForm } from "@/components/todo-form";
import { KanbanBoard } from "@/components/kanban-board";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [todosData, setTodosData] = useState<TodoPaginated | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoDto | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View states
  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TodoStatus | "">("");

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/current-user`, {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        credentials: "include"
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data);
    } catch (err) {
      logout();
    }
  }, []);

  const fetchTodos = useCallback(async (page: number, search?: string, status?: string) => {
    setIsLoadingTodos(true);
    try {
      const params: any = {
        page,
        limit: viewMode === "kanban" ? 100 : 10, // Fetch more for Kanban
        search: search || "",
        status: viewMode === "kanban" ? "" : (status || "")
      };
      const data = await todoService.getTodos(params);
      setTodosData(data);
    } catch (err) {
      console.error("Failed to fetch todos", err);
    } finally {
      setIsLoadingTodos(false);
    }
  }, [viewMode]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchTodos(currentPage, debouncedSearchQuery, statusFilter);
  }, [currentPage, debouncedSearchQuery, statusFilter, fetchTodos]);

  const handleCreateOrUpdate = async (data: CreateTodoRequest | UpdateTodoRequest) => {
    setIsSubmitting(true);
    try {
      if (editingTodo) {
        await todoService.updateTodo(editingTodo.id, data as UpdateTodoRequest);
      } else {
        await todoService.createTodo(data as CreateTodoRequest);
      }
      setIsFormOpen(false);
      setEditingTodo(undefined);
      fetchTodos(currentPage, debouncedSearchQuery, statusFilter);
    } catch (err) {
      console.error("Operation failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this todo?")) {
      try {
        await todoService.deleteTodo(id);
        fetchTodos(currentPage, debouncedSearchQuery, statusFilter);
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: TodoStatus) => {
    try {
      await todoService.updateTodo(id, { status: newStatus });
      fetchTodos(currentPage, debouncedSearchQuery, statusFilter);
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const openEditForm = (todo: TodoDto) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  if (!user) return <div className="h-screen flex items-center justify-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <h1 className="font-bold text-xl flex items-center gap-2 text-indigo-600">
          <ShieldCheck /> SecureApp
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold">{user.first_name} {user.last_name}</span>
            <span className="text-xs text-slate-500">{user.email}</span>
          </div>
          <Button variant="ghost" onClick={logout} className="text-red-500 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* User Stats Card */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full"><User size={40} /></div>
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl">Welcome back, {user.first_name}!</CardTitle>
              <p className="opacity-80">Managing {todosData?.total || 0} tasks total</p>
            </div>
            <div className="flex gap-2">
              <div className="bg-white/10 p-1 rounded-lg flex gap-1">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={cn(viewMode === "grid" ? "bg-white text-indigo-600" : "text-white hover:bg-white/20")}
                >
                  <LayoutGrid size={16} className="mr-2" /> Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "kanban" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("kanban")}
                  className={cn(viewMode === "kanban" ? "bg-white text-indigo-600" : "text-white hover:bg-white/20")}
                >
                  <Columns size={16} className="mr-2" /> Kanban
                </Button>
              </div>
              <Button
                onClick={() => { setEditingTodo(undefined); setIsFormOpen(true); }}
                className="bg-white text-indigo-600 hover:bg-white/90 font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> New Task
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filters Bar */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Search size={12} /> Search Tasks
                </label>
                <div className="relative">
                  <Input
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {viewMode === "grid" && (
                <div className="w-full md:w-48 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <SlidersHorizontal size={12} /> Status
                  </label>
                  <select
                    className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as TodoStatus | ""); setCurrentPage(1); }}
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}

              {(searchQuery || (statusFilter && viewMode === "grid")) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-indigo-600 h-10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Todo Form Overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="w-full max-w-lg">
              <TodoForm
                initialData={editingTodo}
                onSubmit={handleCreateOrUpdate}
                onCancel={() => { setIsFormOpen(false); setEditingTodo(undefined); }}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        {isLoadingTodos ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <LoadingSpinner />
            <p className="text-slate-400 text-sm animate-pulse">Fetching your tasks...</p>
          </div>
        ) : todosData?.contents.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListTodo size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No tasks found</h3>
            <p className="text-slate-500 mb-6 max-w-xs mx-auto">
              {searchQuery || statusFilter
                ? "We couldn't find any tasks matching your current filters."
                : "You haven't created any tasks yet. Start being productive today!"}
            </p>
            {searchQuery || statusFilter ? (
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            ) : (
              <Button className="bg-indigo-600" onClick={() => setIsFormOpen(true)}>Create your first task</Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todosData?.contents.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <KanbanBoard
            todos={todosData?.contents || []}
            onStatusChange={handleStatusChange}
            onEdit={openEditForm}
            onDelete={handleDelete}
          />
        )}

        {/* Enhanced Pagination Controls - Only in Grid Mode */}
        {viewMode === "grid" && todosData && todosData.contents.length > 0 && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{todosData.contents.length}</span> of <span className="font-semibold text-slate-700">{todosData.total}</span> tasks
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1 || isLoadingTodos || todosData.total_pages <= 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
                className="h-9 w-9"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={!todosData.has_previous || isLoadingTodos || todosData.total_pages <= 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                title="Previous Page"
                className="h-9 w-9"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="px-4 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                <span className="text-sm font-bold text-indigo-600">
                  {todosData.current_page}
                </span>
                <span className="text-sm text-slate-400 mx-1">/</span>
                <span className="text-sm text-slate-500">
                  {todosData.total_pages || 1}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={!todosData.has_next || isLoadingTodos || todosData.total_pages <= 1}
                onClick={() => setCurrentPage(prev => prev + 1)}
                title="Next Page"
                className="h-9 w-9"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === todosData.total_pages || isLoadingTodos || todosData.total_pages <= 1}
                onClick={() => setCurrentPage(todosData.total_pages)}
                title="Last Page"
                className="h-9 w-9"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}

