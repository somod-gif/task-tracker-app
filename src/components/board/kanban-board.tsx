"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardItem } from "@/components/board/card-item";
import { CardModal } from "@/components/board/card-modal";
import { createCardAction } from "@/server/actions/card-actions";
import { createListAction, moveCardAction, reorderListsAction, deleteListAction, updateListAction } from "@/server/actions/list-actions";
import { appToast } from "@/lib/toast";

type Member = { id: string; name: string; email: string; avatar: string | null; role: string };

type CardData = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  order: number;
  coverColor: string | null;
  assignments: { user: { id: string; name: string; avatar: string | null } }[];
  _count: { comments: number };
};

type ListData = {
  id: string;
  title: string;
  order: number;
  cards: CardData[];
};

type BoardData = {
  id: string;
  title: string;
  lists: ListData[];
};

type Props = {
  board: BoardData;
  workspaceId: string;
  currentUserId: string;
  workspaceMembers: Member[];
  canManage: boolean;
};

export function KanbanBoard({ board, workspaceId, currentUserId, workspaceMembers, canManage }: Props) {
  const [lists, setLists] = useState<ListData[]>(board.lists);
  const [addingListTitle, setAddingListTitle] = useState("");
  const [showAddList, setShowAddList] = useState(false);
  const [addingCardListId, setAddingCardListId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState("");

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === "LIST") {
      const newLists = [...lists];
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      setLists(newLists.map((l, i) => ({ ...l, order: i })));

      await reorderListsAction(workspaceId, board.id, newLists.map((l) => l.id));
      return;
    }

    // Card move
    const sourceList = lists.find((l) => l.id === source.droppableId);
    const destList = lists.find((l) => l.id === destination.droppableId);
    if (!sourceList || !destList) return;

    const newLists = lists.map((l) => ({ ...l, cards: [...l.cards] }));
    const sourceListCopy = newLists.find((l) => l.id === source.droppableId)!;
    const destListCopy = newLists.find((l) => l.id === destination.droppableId)!;

    const [movedCard] = sourceListCopy.cards.splice(source.index, 1);
    movedCard.order = destination.index;
    destListCopy.cards.splice(destination.index, 0, movedCard);

    setLists(newLists);

    await moveCardAction({
      workspaceId,
      boardId: board.id,
      cardId: movedCard.id,
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      destinationIndex: destination.index,
    });
  }, [lists, workspaceId, board.id]);

  async function handleAddList() {
    const title = addingListTitle.trim();
    if (!title) return;

    const result = await createListAction(workspaceId, board.id, title);
    if (result.success && result.list) {
      setLists((prev) => [...prev, { ...result.list!, cards: [] }]);
      setAddingListTitle("");
      setShowAddList(false);
    } else {
      appToast.error("Failed to create list");
    }
  }

  async function handleAddCard(listId: string) {
    const title = newCardTitle.trim();
    if (!title) return;

    const result = await createCardAction(workspaceId, listId, title);
    if (result.success && result.card) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                cards: [
                  ...l.cards,
                  {
                    ...result.card!,
                    description: null,
                    dueDate: null,
                    priority: "MEDIUM" as const,
                    coverColor: null,
                    assignments: [],
                    _count: { comments: 0 },
                  },
                ],
              }
            : l
        )
      );
      setNewCardTitle("");
      setAddingCardListId(null);
    } else {
      appToast.error("Failed to create card");
    }
  }

  async function handleDeleteList(listId: string) {
    const result = await deleteListAction(workspaceId, listId);
    if (result.success) {
      setLists((prev) => prev.filter((l) => l.id !== listId));
    } else {
      appToast.error("Failed to delete list");
    }
  }

  async function handleRenameList(listId: string, newTitle: string) {
    if (!newTitle.trim()) return;
    const result = await updateListAction(workspaceId, listId, newTitle.trim());
    if (result.success) {
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, title: newTitle.trim() } : l)));
    }
    setEditingListId(null);
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex h-full items-start gap-3 overflow-x-auto p-4 pb-6"
            >
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={list.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex max-h-[calc(100vh-140px)] w-72 shrink-0 flex-col rounded-2xl border border-border/60 bg-card shadow-sm ${
                        snapshot.isDragging ? "shadow-xl ring-2 ring-primary/30 rotate-1" : ""
                      }`}
                    >
                      {/* List Header */}
                      <div className="flex items-center justify-between p-3 pb-2" {...provided.dragHandleProps}>
                        {editingListId === list.id ? (
                          <Input
                            className="h-7 text-sm font-semibold"
                            value={editingListTitle}
                            onChange={(e) => setEditingListTitle(e.target.value)}
                            onBlur={() => handleRenameList(list.id, editingListTitle)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameList(list.id, editingListTitle);
                              if (e.key === "Escape") setEditingListId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <h3
                            className="flex-1 cursor-pointer text-sm font-semibold text-foreground truncate"
                            onClick={() => {
                              setEditingListId(list.id);
                              setEditingListTitle(list.title);
                            }}
                          >
                            {list.title}
                          </h3>
                        )}
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{list.cards.length}</span>
                          {canManage && (
                            <button
                              onClick={() => handleDeleteList(list.id)}
                              className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete list"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cards */}
                      <Droppable droppableId={list.id} type="CARD">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`flex-1 space-y-2 overflow-y-auto px-3 pb-2 min-h-[2px] ${
                              snapshot.isDraggingOver ? "rounded-xl bg-primary/5" : ""
                            }`}
                          >
                            {list.cards.map((card, cardIndex) => (
                              <Draggable key={card.id} draggableId={card.id} index={cardIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <CardItem
                                      card={card}
                                      isDragging={snapshot.isDragging}
                                      onClick={() => setSelectedCardId(card.id)}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      {/* Add Card */}
                      <div className="p-2 pt-0">
                        {addingCardListId === list.id ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full resize-none rounded-lg border border-border bg-card p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                              placeholder="Card title…"
                              rows={2}
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddCard(list.id);
                                }
                                if (e.key === "Escape") {
                                  setAddingCardListId(null);
                                  setNewCardTitle("");
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex gap-1.5">
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleAddCard(list.id)}>
                                Add card
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setAddingCardListId(null);
                                  setNewCardTitle("");
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingCardListId(list.id);
                              setNewCardTitle("");
                            }}
                            className="flex w-full items-center gap-1.5 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                          >
                            <Plus className="h-4 w-4" />
                            Add a card
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add List */}
              <div className="w-72 shrink-0">
                {showAddList ? (
                  <div className="space-y-2 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
                    <Input
                      placeholder="List title…"
                      value={addingListTitle}
                      onChange={(e) => setAddingListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddList();
                        if (e.key === "Escape") {
                          setShowAddList(false);
                          setAddingListTitle("");
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 text-xs" onClick={handleAddList}>
                        Add list
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => {
                          setShowAddList(false);
                          setAddingListTitle("");
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddList(true)}
                    className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-card p-3 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                    Add a list
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Card Modal */}
      {selectedCardId && (
        <CardModal
          cardId={selectedCardId}
          workspaceId={workspaceId}
          workspaceMembers={workspaceMembers}
          currentUserId={currentUserId}
          canManage={canManage}
          onClose={() => setSelectedCardId(null)}
          onCardDeleted={() => {
            setLists((prev) =>
              prev.map((list) => ({
                ...list,
                cards: list.cards.filter((c) => c.id !== selectedCardId),
              }))
            );
          }}
        />
      )}
    </>
  );
}
