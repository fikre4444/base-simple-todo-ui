import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAccessToken, logout } from "@/lib/auth-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LogOut,
    ShieldCheck,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ListTodo,
    LayoutGrid,
    Columns,
    ArrowLeft,
    Calendar,
    MoreVertical,
    Search,
    X,
    RotateCcw,
    SlidersHorizontal
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { todoService } from "@/lib/todo-service";
import type {
    TodoDto,
    TodoItemDto,
    TodoItemPaginated,
    CreateTodoItemRequest,
    UpdateTodoItemRequest,
    TodoStatus
} from "@/lib/todo-service";
import { TodoCard } from "@/components/todo-card";
import { TodoItemForm } from "@/components/todo-item-form";
import { KanbanBoard } from "@/components/kanban-board";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const statusColors: Record<TodoStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

export default function TodoDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [mainTodo, setMainTodo] = useState<TodoDto | null>(null);
    const [itemsData, setItemsData] = useState<TodoItemPaginated | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingItems, setIsLoadingItems] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TodoItemDto | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // View states
    const [viewMode, setViewMode] = useState<"grid" | "kanban">("kanban");

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
                headers: { Authorization: `Bearer ${getAccessToken()}` }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setUser(data);
        } catch (err) {
            logout();
        }
    }, []);

    const fetchMainTodo = useCallback(async () => {
        if (!id) return;
        try {
            const data = await todoService.getTodoById(id);
            setMainTodo(data);
        } catch (err) {
            console.error("Failed to fetch main todo", err);
            navigate("/dashboard");
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    const fetchItems = useCallback(async (page: number, search?: string, status?: string) => {
        if (!id) return;
        setIsLoadingItems(true);
        try {
            const params: any = {
                page,
                limit: viewMode === "kanban" ? 100 : 10,
                search: search || "",
                status: viewMode === "kanban" ? "" : (status || "")
            };
            const data = await todoService.getTodoItems(id, params);
            setItemsData(data);
        } catch (err) {
            console.error("Failed to fetch items", err);
        } finally {
            setIsLoadingItems(false);
        }
    }, [id, viewMode]);

    useEffect(() => {
        fetchUser();
        fetchMainTodo();
    }, [fetchUser, fetchMainTodo]);

    useEffect(() => {
        fetchItems(currentPage, debouncedSearchQuery, statusFilter);
    }, [currentPage, debouncedSearchQuery, statusFilter, fetchItems]);

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
        setStatusFilter("");
        setCurrentPage(1);
    };

    const handleCreateOrUpdateItem = async (data: CreateTodoItemRequest | UpdateTodoItemRequest) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            if (editingItem) {
                await todoService.updateTodoItem(id, editingItem.id, data as UpdateTodoItemRequest);
            } else {
                await todoService.createTodoItem(id, data as CreateTodoItemRequest);
            }
            setIsFormOpen(false);
            setEditingItem(undefined);
            fetchItems(currentPage);
        } catch (err) {
            console.error("Operation failed", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!id) return;
        if (confirm("Are you sure you want to delete this subtask?")) {
            try {
                await todoService.deleteTodoItem(id, itemId);
                fetchItems(currentPage);
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    const handleStatusChange = async (itemId: string, newStatus: TodoStatus) => {
        if (!id) return;
        try {
            await todoService.updateTodoItem(id, itemId, { status: newStatus });
            fetchItems(currentPage);
        } catch (err) {
            console.error("Status update failed", err);
        }
    };

    const openEditForm = (item: TodoItemDto) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    if (isLoading || !user) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-slate-500 hover:text-indigo-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="font-bold text-xl flex items-center gap-2 text-indigo-600">
                        <ShieldCheck /> Todo Detail
                    </h1>
                </div>
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
                {/* Main Todo Header Card */}
                {mainTodo && (
                    <Card className="bg-white border-none shadow-lg overflow-hidden border-l-8 border-indigo-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <Badge className={cn("px-3 py-1 text-xs font-bold", statusColors[mainTodo.status])}>
                                    {mainTodo.status.replace("_", " ")}
                                </Badge>
                                <div className="flex items-center text-xs text-slate-400 font-medium tracking-tight">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Created {new Date(mainTodo.created_timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreVertical size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4 pb-6">
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{mainTodo.title}</h2>
                            {mainTodo.description && (
                                <p className="text-slate-600 text-lg leading-relaxed max-w-4xl">{mainTodo.description}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Filters Bar */}
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                    <Search size={12} /> Search Subtasks
                                </label>
                                <div className="relative">
                                    <Input
                                        placeholder="Search subtasks..."
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value as TodoStatus | ""); setCurrentPage(1); }}
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

                {/* Items Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-slate-800">Subtasks</h3>
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700 font-bold px-2.5">
                            {itemsData?.total || 0}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-white p-1 rounded-lg flex gap-1 border border-slate-200 shadow-sm">
                            <Button
                                size="sm"
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                onClick={() => setViewMode("grid")}
                                className={cn(viewMode === "grid" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-500 hover:bg-slate-100")}
                            >
                                <LayoutGrid size={16} className="mr-2" /> List
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                                onClick={() => setViewMode("kanban")}
                                className={cn(viewMode === "kanban" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-500 hover:bg-slate-100")}
                            >
                                <Columns size={16} className="mr-2" /> Kanban
                            </Button>
                        </div>
                        <Button
                            onClick={() => { setEditingItem(undefined); setIsFormOpen(true); }}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Subtask
                        </Button>
                    </div>
                </div>

                {/* Todo Item Form Overlay */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="w-full max-w-lg">
                            <TodoItemForm
                                initialData={editingItem}
                                onSubmit={handleCreateOrUpdateItem}
                                onCancel={() => { setIsFormOpen(false); setEditingItem(undefined); }}
                                isLoading={isSubmitting}
                            />
                        </div>
                    </div>
                )}

                {/* Content Area */}
                {isLoadingItems ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <LoadingSpinner />
                        <p className="text-slate-400 text-sm animate-pulse">Loading items...</p>
                    </div>
                ) : itemsData?.contents.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ListTodo size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">No subtasks yet</h3>
                        <p className="text-slate-500 mb-6 max-w-xs mx-auto">
                            Break down "{mainTodo?.title}" into smaller, manageable steps.
                        </p>
                        <Button className="bg-indigo-600" onClick={() => setIsFormOpen(true)}>Create first subtask</Button>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {itemsData?.contents.map((item) => (
                            <TodoCard
                                key={item.id}
                                todo={item}
                                onEdit={openEditForm}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                ) : (
                    <KanbanBoard
                        todos={itemsData?.contents || []}
                        onStatusChange={handleStatusChange}
                        onEdit={openEditForm}
                        onDelete={handleDeleteItem}
                    />
                )}

                {/* Pagination - Only in Grid Mode */}
                {viewMode === "grid" && itemsData && itemsData.contents.length > 0 && itemsData.total_pages > 1 && (
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 py-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{itemsData.contents.length}</span> of <span className="font-semibold text-slate-700">{itemsData.total}</span> items
                        </p>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                                className="h-9 w-9"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!itemsData.has_previous}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="h-9 w-9"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="px-4 py-1.5 bg-slate-50 rounded-md border border-slate-200">
                                <span className="text-sm font-bold text-indigo-600">{itemsData.current_page} / {itemsData.total_pages}</span>
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!itemsData.has_next}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="h-9 w-9"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={currentPage === itemsData.total_pages}
                                onClick={() => setCurrentPage(itemsData.total_pages)}
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
