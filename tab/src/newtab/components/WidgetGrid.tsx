/**
 * 组件网格 - 统一渲染快捷方式和小组件
 * 支持不同尺寸的组件和拖拽排序
 */

import { useState, useCallback, useMemo } from 'react';
import { Plus, Settings2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNewtabStore } from '../hooks/useNewtabStore';
import { WidgetRenderer } from './widgets/WidgetRenderer';
import { WidgetSelector } from './widgets/WidgetSelector';
import { WidgetConfigModal } from './widgets/WidgetConfigModal';
import { AddShortcutModal } from './AddShortcutModal';
import { AddBookmarkFolderModal } from './AddBookmarkFolderModal';
import { FAVICON_API } from '../constants';
import type { GridItem, GridItemType } from '../types';
import { getSizeSpan } from './widgets/widgetRegistry';

interface WidgetGridProps {
  columns: 6 | 8 | 10;
}

// 可排序的网格项包装器
function SortableGridItem({
  item,
  onUpdate,
  onRemove,
  isEditing,
  onConfigClick,
}: {
  item: GridItem;
  onUpdate?: (id: string, updates: Partial<GridItem>) => void;
  onRemove?: (id: string) => void;
  isEditing?: boolean;
  onConfigClick?: (item: GridItem) => void;
}) {
  const { cols, rows } = getSizeSpan(item.size);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${cols}`,
    gridRow: `span ${rows}`,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isEditing && item.type !== 'shortcut') {
      e.preventDefault();
      e.stopPropagation();
      onConfigClick?.(item);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? { ...attributes, ...listeners } : {})}
      className={`touch-none ${isEditing ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <WidgetRenderer
        item={item}
        onUpdate={onUpdate}
        onRemove={onRemove}
        isEditing={isEditing}
      />
    </div>
  );
}

export function WidgetGrid({ columns }: WidgetGridProps) {
  const {
    shortcutGroups,
    activeGroupId,
    gridItems,
    addGridItem,
    updateGridItem,
    removeGridItem,
    getFilteredGridItems,
    migrateToGridItems,
    currentFolderId,
    setCurrentFolderId,
    moveGridItemToFolder,
    reorderGridItemsInCurrentScope,
  } = useNewtabStore();

  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [configItem, setConfigItem] = useState<GridItem | null>(null);

  // 首次加载时尝试迁移数据
  useMemo(() => {
    migrateToGridItems();
  }, [migrateToGridItems]);

  // 获取当前分组的网格项
  const filteredItems = getFilteredGridItems();

  const folderPath = useMemo(() => {
    if (!currentFolderId) return [] as GridItem[];
    const byId = new Map(gridItems.map((i) => [i.id, i] as const));
    const path: GridItem[] = [];
    let cursor: string | null = currentFolderId;

    while (cursor) {
      const item = byId.get(cursor);
      if (!item || item.type !== 'bookmarkFolder') break;
      path.unshift(item);
      cursor = item.parentId ?? null;
    }

    return path;
  }, [currentFolderId, gridItems]);

  // 当前分组名称
  const currentGroupName = activeGroupId
    ? shortcutGroups.find((g) => g.id === activeGroupId)?.name
    : undefined;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 响应式网格列数
  const gridCols = {
    6: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    8: 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8',
    10: 'grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10',
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const overItem = gridItems.find((item) => item.id === over.id);
      if (overItem?.type === 'bookmarkFolder') {
        moveGridItemToFolder(active.id as string, overItem.id);
        return;
      }

      reorderGridItemsInCurrentScope(active.id as string, over.id as string);
    },
    [gridItems, moveGridItemToFolder, reorderGridItemsInCurrentScope]
  );

  // 添加快捷方式
  const handleAddShortcut = useCallback(
    (url: string, title: string) => {
      const domain = new URL(url).hostname;
      addGridItem('shortcut', {
        shortcut: {
          url,
          title,
          favicon: `${FAVICON_API}${domain}&sz=64`,
        },
        groupId: activeGroupId || undefined,
      });
    },
    [addGridItem, activeGroupId]
  );

  // 添加组件
  const handleAddWidget = useCallback(
    (type: GridItemType) => {
      if (type === 'shortcut') {
        setShowAddShortcut(true);
      } else if (type === 'bookmarkFolder') {
        setShowAddFolder(true);
      } else {
        addGridItem(type, {
          groupId: activeGroupId || undefined,
        });
      }
    },
    [addGridItem, activeGroupId]
  );

  // 获取当前拖拽的项
  const activeItem = activeId
    ? gridItems.find((item) => item.id === activeId)
    : null;

  // 空状态
  if (filteredItems.length === 0) {
    return (
      <>
        {folderPath.length > 0 && (
          <div className="w-full max-w-5xl px-2 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <button
                onClick={() => {
                  const current = folderPath[folderPath.length - 1];
                  setCurrentFolderId(current?.parentId ?? null);
                }}
                className="px-2 py-1 rounded-lg glass hover:bg-white/20 transition-colors flex items-center gap-1"
                title="返回"
              >
                <ChevronLeft className="w-4 h-4" />
                返回
              </button>
              <span className="text-white/40">/</span>
              {folderPath.map((f, idx) => (
                <span key={f.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFolderId(f.id)}
                    className="hover:text-white transition-colors"
                  >
                    {f.bookmarkFolder?.title || '文件夹'}
                  </button>
                  {idx < folderPath.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                  )}
                </span>
              ))}
            </div>
            <button
              onClick={() => setCurrentFolderId(null)}
              className="px-2 py-1 rounded-lg glass hover:bg-white/20 transition-colors text-white/70 text-sm"
              title="回到根目录"
            >
              根目录
            </button>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setShowWidgetSelector(true)}
            className="w-16 h-16 rounded-2xl glass hover:bg-white/20 flex items-center justify-center transition-all group"
            title="添加组件"
          >
            <Plus className="w-8 h-8 text-white/50 group-hover:text-white/80 transition-colors" />
          </button>
          <span className="text-sm text-white/50">点击添加组件</span>
        </div>

        <WidgetSelector
          isOpen={showWidgetSelector}
          onClose={() => setShowWidgetSelector(false)}
          onSelect={handleAddWidget}
        />

        <AddShortcutModal
          isOpen={showAddShortcut}
          onClose={() => setShowAddShortcut(false)}
          onAdd={handleAddShortcut}
          groupName={currentGroupName}
        />

        <AddBookmarkFolderModal
          isOpen={showAddFolder}
          onClose={() => setShowAddFolder(false)}
          onSave={(name) => {
            addGridItem('bookmarkFolder', {
              groupId: activeGroupId || undefined,
              bookmarkFolder: { title: name },
            });
          }}
        />
      </>
    );
  }

  return (
    <>
      {folderPath.length > 0 && (
        <div className="w-full max-w-5xl px-2 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <button
              onClick={() => setCurrentFolderId(folderPath[folderPath.length - 1]?.parentId ?? null)}
              className="px-2 py-1 rounded-lg glass hover:bg-white/20 transition-colors flex items-center gap-1"
              title="返回"
            >
              <ChevronLeft className="w-4 h-4" />
              返回
            </button>
            <span className="text-white/40">/</span>
            {folderPath.map((f, idx) => (
              <span key={f.id} className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentFolderId(f.id)}
                  className="hover:text-white transition-colors"
                >
                  {f.bookmarkFolder?.title || '文件夹'}
                </button>
                {idx < folderPath.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                )}
              </span>
            ))}
          </div>
          <button
            onClick={() => setCurrentFolderId(null)}
            className="px-2 py-1 rounded-lg glass hover:bg-white/20 transition-colors text-white/70 text-sm"
            title="回到根目录"
          >
            根目录
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredItems.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div
            className={`grid ${gridCols[columns]} gap-4 auto-rows-[80px]`}
          >
            {filteredItems.map((item) => (
              <SortableGridItem
                key={item.id}
                item={item}
                onUpdate={updateGridItem}
                onRemove={removeGridItem}
                isEditing={isEditing}
                onConfigClick={setConfigItem}
              />
            ))}

            {/* 添加按钮 - 仅在编辑模式显示 */}
            {isEditing && (
              <button
                onClick={() => setShowWidgetSelector(true)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                           glass hover:bg-white/20 transition-all duration-200
                           cursor-pointer group aspect-square"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Plus className="w-6 h-6 text-white/60" />
                </div>
                <span className="text-xs text-white/60">添加</span>
              </button>
            )}
          </div>
        </SortableContext>

        {/* 拖拽预览 */}
        <DragOverlay>
          {activeItem && (
            <div className="opacity-80">
              <WidgetRenderer item={activeItem} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* 组件选择器 */}
      <WidgetSelector
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onSelect={handleAddWidget}
      />

      {/* 添加快捷方式弹窗 */}
      <AddShortcutModal
        isOpen={showAddShortcut}
        onClose={() => setShowAddShortcut(false)}
        onAdd={handleAddShortcut}
        groupName={currentGroupName}
      />

      <AddBookmarkFolderModal
        isOpen={showAddFolder}
        onClose={() => setShowAddFolder(false)}
        onSave={(name) => {
          addGridItem('bookmarkFolder', {
            groupId: activeGroupId || undefined,
            bookmarkFolder: { title: name },
          });
        }}
      />

      {/* 组件配置弹窗 */}
      {configItem && (
        <WidgetConfigModal
          item={configItem}
          isOpen={!!configItem}
          onClose={() => setConfigItem(null)}
          onUpdate={updateGridItem}
          onRemove={removeGridItem}
        />
      )}

      {/* 编辑模式按钮 */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-3 rounded-full shadow-lg transition-all ${
            isEditing
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'glass hover:bg-white/20 text-white/70'
          }`}
          title={isEditing ? '完成编辑' : '编辑布局'}
        >
          {isEditing ? (
            <Check className="w-5 h-5" />
          ) : (
            <Settings2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 编辑模式提示 */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full glass text-sm text-white/80 animate-fadeIn">
          拖拽调整位置 · 双击配置组件 · 点击 ✓ 完成
        </div>
      )}
    </>
  );
}
