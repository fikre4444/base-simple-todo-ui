import type { TodoDto, TodoStatus } from "@/lib/todo-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Calendar, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface TodoCardProps {
    todo: TodoDto;
    onEdit: (todo: TodoDto) => void;
    onDelete: (id: string) => void;
    isDraggable?: boolean;
}

const statusColors: Record<TodoStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

export function TodoCard({ todo, onEdit, onDelete, isDraggable = false }: TodoCardProps) {
    const formattedDate = new Date(todo.created_timestamp).toLocaleDateString();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: todo.id,
        disabled: !isDraggable,
        data: {
            type: "todo",
            todo,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const cardContent = (
        <Card
            className={cn(
                "hover:shadow-md transition-shadow bg-white",
                isDragging && "opacity-50 border-indigo-400 border-2"
            )}
        >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        {isDraggable && (
                            <div
                                {...listeners}
                                {...attributes}
                                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-colors"
                                title="Drag to update status"
                            >
                                <GripVertical size={16} />
                            </div>
                        )}
                        <Badge className={statusColors[todo.status]}>
                            {todo.status.replace("_", " ")}
                        </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold mt-1">{todo.title}</CardTitle>
                </div>
                <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(todo)} className="h-8 w-8">
                        <Edit2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)} className="h-8 w-8">
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

    return (
        <div ref={setNodeRef} style={style} className="w-full">
            {cardContent}
        </div>
    );
}

