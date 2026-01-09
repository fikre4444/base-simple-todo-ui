import { useDroppable, useDndContext } from "@dnd-kit/core";
import type { TodoDto, TodoStatus } from "@/lib/todo-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    status: TodoStatus;
    todos: TodoDto[];
    title: string;
    children?: React.ReactNode;
}

export function KanbanColumn({ status, title, children, todos }: KanbanColumnProps) {
    const { setNodeRef, isOver: isDirectlyOver } = useDroppable({
        id: status,
        data: { status },
    });

    const { over } = useDndContext();

    // Improved over detection:
    // 1. Directly over the column droppable
    // 2. Over a todo card that belongs to this column's status
    const isOver = isDirectlyOver || (over?.data.current?.todo?.status === status) || (over?.data.current?.status === status);


    const statusColors: Record<TodoStatus, string> = {
        PENDING: "border-t-yellow-400",
        IN_PROGRESS: "border-t-blue-400",
        COMPLETED: "border-t-green-400",
    };

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full min-h-[500px] w-full max-w-sm transition-all duration-200"
        >
            <Card className={cn(
                "h-full border-t-4 transition-all duration-300 shadow-sm flex flex-col",
                statusColors[status],
                isOver ? "bg-slate-200 shadow-md ring-2 ring-indigo-400/50 border-slate-300" : "bg-slate-50/50 border-slate-200"
            )}>
                <CardHeader className="py-4 flex flex-row items-center justify-between shrink-0">
                    <CardTitle className={cn(
                        "text-sm font-bold uppercase tracking-wider transition-colors",
                        isOver ? "text-indigo-600" : "text-slate-500"
                    )}>
                        {title}
                    </CardTitle>
                    <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full transition-colors",
                        isOver ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
                    )}>
                        {todos.length}
                    </span>
                </CardHeader>
                <CardContent
                    className={cn(
                        "flex flex-col gap-4 p-4 min-h-[200px] flex-1"
                    )}
                >
                    {children}
                    {todos.length === 0 && (
                        <div className={cn(
                            "flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg transition-colors h-full flex-1",
                            isOver ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200 text-slate-400"
                        )}>
                            <p className={cn(
                                "text-xs italic",
                                isOver ? "text-indigo-500 font-medium" : "text-slate-400"
                            )}>
                                {isOver ? "Release to drop" : "Drop here"}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
