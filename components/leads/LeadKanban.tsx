"use client"
import * as React from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult, type DroppableProps } from '@hello-pangea/dnd';
import { LeadCard } from './LeadCard';

export const COLUMNS = ['Prospect', 'Contacted', 'Replied', 'Call Booked', 'Closed Won'];

// Inlined to prevent import resolution and library-standard Strict Mode issues in Next.js 14
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) return null;

  return <Droppable {...props}>{children}</Droppable>;
};

export function LeadKanban({ leads, onStatusChange }: { leads: any[], onStatusChange: (id: string, status: string) => void }) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    const leadId = result.draggableId;

    if (sourceCol === destCol) return;

    await onStatusChange(leadId, destCol);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-280px)] items-start">
        {COLUMNS.map(column => {
          const columnLeads = leads.filter((l: any) => l.status === column);
          
          return (
            <div key={column} className="flex-shrink-0 w-72 bg-[#09090b] rounded-xl border border-zinc-800 flex flex-col h-full overflow-hidden">
               <div className="p-3 border-b border-zinc-800 bg-[#18181b] flex items-center justify-between">
                 <h3 className="font-bold text-sm text-zinc-300">{column}</h3>
                 <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {columnLeads.length}
                 </span>
               </div>
               
               <StrictModeDroppable droppableId={column}>
                  {(provided, snapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''}`}
                    >
                       {columnLeads.map((lead: any, index: number) => (
                         <Draggable key={lead.id} draggableId={lead.id} index={index}>
                           {(p, s) => (
                             <div 
                               ref={p.innerRef} 
                               {...p.draggableProps} 
                               {...p.dragHandleProps} 
                               style={{...p.draggableProps.style, marginBottom: '12px'}}
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
          )
        })}
      </div>
    </DragDropContext>
  );
}
