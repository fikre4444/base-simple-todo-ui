import type { TodoDto, TodoStatus } from "@/lib/todo-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Calendar } from "lucide-react";

interface TodoCardProps {
    todo: TodoDto;
    onEdit: (todo: TodoDto) => void;
    onDelete: (id: string) => void;
}

const statusColors: Record<TodoStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

export function TodoCard({ todo, onEdit, onDelete }: TodoCardProps) {
    const formattedDate = new Date(todo.created_timestamp).toLocaleDateString();

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <Badge className={statusColors[todo.status]}>
                        {todo.status.replace("_", " ")}
                    </Badge>
                    <CardTitle className="text-xl font-bold">{todo.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(todo)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {todo.description && (
                    <p className="text-slate-600 mb-4 text-sm line-clamp-2">{todo.description}</p>
                )}
                <div className="flex items-center text-xs text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    Created on {formattedDate}
                </div>
            </CardContent>
        </Card>
    );
}
