import { memo } from 'react';
import { Folder, X } from 'lucide-react';
import type { WidgetRendererProps } from './types';
import { useNewtabStore } from '../../hooks/useNewtabStore';

export const BookmarkFolderWidget = memo(function BookmarkFolderWidget({
  item,
  onRemove,
  isEditing,
}: WidgetRendererProps) {
  const { setCurrentFolderId } = useNewtabStore();
  const title = item.bookmarkFolder?.title || '文件夹';

  const handleClick = (e: React.MouseEvent) => {
    if (isEditing) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setCurrentFolderId(item.id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex flex-col items-center justify-center h-full p-2 rounded-xl 
                 glass-card hover:bg-white/20 transition-all duration-200 cursor-pointer w-full"
      aria-label={title}
    >
      {isEditing && onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white 
                     opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="删除文件夹"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
        <Folder className="w-6 h-6 text-white/70" />
      </div>

      <span className="mt-1.5 text-xs text-white/80 truncate max-w-full px-1">
        {title}
      </span>
    </button>
  );
});
