"use client"
import * as React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProps } from '@hello-pangea/dnd';
import { LeadCard } from './LeadCard';

export const COLUMNS = ['Prospect', 'Contacted', 'Replied', 'Call Booked', 'Closed Won'];

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setEnabled(true));
    return () => { cancelAnimationFrame(id); setEnabled(false); };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

export function LeadKanban({ leads, onStatusChange }: { leads: any[]; onStatusChange: (id: string, status: string) => void }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.droppableId === result.destination.droppableId) return;
    await onStatusChange(result.draggableId, result.destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-280px)] items-start">
        {COLUMNS.map(column => {
          const columnLeads = leads.filter((l: any) => l.status === column);
          return (
            <div
              key={column}
              className="flex-shrink-0 w-72 rounded-2xl border flex flex-col h-full overflow-hidden"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <div className="p-3 border-b flex items-center justify-between" style={{ background: 'var(--app-bg)', borderColor: 'var(--border)' }}>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{column}</h3>
                <span className="text-xs font-mono rounded-full px-2 py-0.5 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  {columnLeads.length}
                </span>
              </div>
              <StrictModeDroppable droppableId={column}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 p-3 overflow-y-auto transition-colors"
                    style={{ background: snapshot.isDraggingOver ? 'var(--accent-muted)' : undefined }}
                  >
                    {columnLeads.map((lead: any, index: number) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(p, s) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            style={{ ...p.draggableProps.style, marginBottom: '10px' }}
                          >
                            <LeadCard lead={lead} isDragging={s.isDragging} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
