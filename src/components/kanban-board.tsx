import {
    DndContext,
    DragOverlay,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import type { TodoDto, TodoItemDto, TodoStatus } from "@/lib/todo-service";
import { KanbanColumn } from "./kanban-column";
import { TodoCard } from "./todo-card";

interface KanbanBoardProps {
    todos: (TodoDto | TodoItemDto)[];
    onStatusChange: (id: string, newStatus: TodoStatus) => Promise<void>;
    onEdit: (todo: any) => void;
    onDelete: (id: string) => void;
    onTodoClick?: (todo: any) => void;
}

export function KanbanBoard({ todos, onStatusChange, onEdit, onDelete, onTodoClick }: KanbanBoardProps) {
    const [activeTodo, setActiveTodo] = useState<TodoDto | TodoItemDto | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns: { status: TodoStatus; title: string }[] = [
        { status: "PENDING", title: "Pending" },
        { status: "IN_PROGRESS", title: "In Progress" },
        { status: "COMPLETED", title: "Completed" },
    ];

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const todo = active.data.current?.todo;
        if (todo) setActiveTodo(todo);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTodo(null);

        if (!over) return;

        const activeId = active.id as string;

        // Resolve the target status from the drop target
        // 1. Check if dropped over a column (KanbanColumn)
        // 2. Check if dropped over a todo card (TodoCard)
        const overData = over.data.current;
        let newStatus: TodoStatus | undefined;

        if (overData?.status) {
            // Dropped directly over a column
            newStatus = overData.status;
        } else if (overData?.todo?.status) {
            // Dropped over another todo card, use that card's status
            newStatus = overData.todo.status;
        } else if (["PENDING", "IN_PROGRESS", "COMPLETED"].includes(over.id as string)) {
            // Fallback: check if the 'over.id' itself is one of our statuses (e.g. dropped on the column container)
            newStatus = over.id as TodoStatus;
        }

        if (newStatus) {
            const todo = todos.find((t) => t.id === activeId);
            if (todo && todo.status !== newStatus) {
                await onStatusChange(activeId, newStatus);
            }
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
                {columns.map((col) => {
                    const columnTodos = todos.filter((t) => t.status === col.status);
                    return (
                        <KanbanColumn key={col.status} status={col.status} title={col.title} todos={columnTodos}>
                            <SortableContext items={columnTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                                {columnTodos.map((todo) => (
                                    <TodoCard
                                        key={todo.id}
                                        todo={todo}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onClick={onTodoClick}
                                        isDraggable={true}
                                    />
                                ))}
                            </SortableContext>
                        </KanbanColumn>
                    );
                })}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: "0.5",
                        },
                    },
                }),
            }}>
                {activeTodo ? (
                    <div className="w-[300px] rotate-3 opacity-90 shadow-2xl">
                        <TodoCard
                            todo={activeTodo}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            isDraggable={true}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
