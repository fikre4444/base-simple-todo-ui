import type { TodoDto, TodoItemDto, TodoStatus } from "@/lib/todo-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Calendar, GripVertical, CheckCircle2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface TodoCardProps {
    todo: TodoDto | TodoItemDto;
    onEdit: (todo: any) => void;
    onDelete: (id: string) => void;
    onClick?: (todo: any) => void;
    isDraggable?: boolean;
}

const statusColors: Record<TodoStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

export function TodoCard({ todo, onEdit, onDelete, onClick, isDraggable = false }: TodoCardProps) {
    const formattedDate = new Date(todo.created_timestamp).toLocaleDateString();

    // Check if it's a TodoItemDto (has is_completed or todo_id)
    const isItem = "todo_id" in todo;

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
            type: isItem ? "todo-item" : "todo",
            todo,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(todo);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(todo.id);
    };

    const handleCardClick = () => {
        if (onClick) onClick(todo);
    };

    const cardContent = (
        <Card
            className={cn(
                "hover:shadow-md transition-all bg-white overflow-hidden",
                onClick && "cursor-pointer hover:border-indigo-300",
                isDragging && "opacity-50 border-indigo-400 border-2 shadow-xl"
            )}
            onClick={handleCardClick}
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
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GripVertical size={16} />
                            </div>
                        )}
                        <Badge className={statusColors[todo.status]}>
                            {todo.status.replace("_", " ")}
                        </Badge>
                        {isItem && (todo as TodoItemDto).is_completed && (
                            <CheckCircle2 size={16} className="text-green-500" />
                        )}
                    </div>
                    <CardTitle className="text-lg font-bold mt-1 line-clamp-1">{todo.title}</CardTitle>
                </div>
                <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8">
                        <Edit2 className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                {todo.description && (
                    <p className="text-slate-600 mb-3 text-sm line-clamp-2">{todo.description}</p>
                )}
                <div className="flex items-center text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formattedDate}
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

