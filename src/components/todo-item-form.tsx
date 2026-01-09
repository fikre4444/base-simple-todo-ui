import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Loader2 } from "lucide-react";
import type { TodoItemDto, CreateTodoItemRequest, UpdateTodoItemRequest, TodoStatus } from "@/lib/todo-service";

interface TodoItemFormProps {
    initialData?: TodoItemDto;
    onSubmit: (data: CreateTodoItemRequest | UpdateTodoItemRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function TodoItemForm({ initialData, onSubmit, onCancel, isLoading }: TodoItemFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [status, setStatus] = useState<TodoStatus>(initialData?.status || "PENDING");
    const [isCompleted, setIsCompleted] = useState(initialData?.is_completed || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            description,
            status,
            is_completed: isCompleted,
        });
    };

    return (
        <Card className="shadow-2xl border-indigo-100">
            <CardHeader className="bg-indigo-50/50 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold text-indigo-900 border-none">
                        {initialData ? "Edit Subtask" : "Add New Subtask"}
                    </CardTitle>
                    <CardDescription>
                        {initialData ? "Refine your subtask details" : "Break down your main task into smaller steps"}
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Subtask Title</label>
                        <Input
                            placeholder="e.g., Research competition"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Status</label>
                            <select
                                className="w-full flex h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TodoStatus)}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={(e) => setIsCompleted(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                                    Mark as Completed
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Description (Optional)</label>
                        <Textarea
                            placeholder="Add some more context..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 min-h-[100px] resize-none"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-slate-50/50 pt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 font-bold">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {initialData ? "Update Subtask" : "Save Subtask"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
