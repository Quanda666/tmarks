/**
 * NewTab 状态管理
 */

import { create } from 'zustand';
import type { Shortcut, ShortcutGroup, ShortcutFolder, NewTabSettings, NewTabStorage, GridItem, GridItemType, GridItemSize } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEY, DEFAULT_GROUPS } from '../constants';
import { StorageService } from '@/lib/utils/storage';
import { getTMarksUrls } from '@/lib/constants/urls';
import { getWidgetMeta, getDefaultWidgetConfig } from '../components/widgets/widgetRegistry';

// 同步 NewTab 数据到后端（静默执行，不阻塞 UI）
async function syncNewtabToBackend(data: {
  shortcuts: Shortcut[];
  groups: ShortcutGroup[];
  folders: ShortcutFolder[];
  settings: NewTabSettings;
  gridItems: GridItem[];
}) {
  try {
    const configuredUrl = await StorageService.getBookmarkSiteApiUrl();
    const apiKey = await StorageService.getBookmarkSiteApiKey();

    if (!apiKey) {
      console.log('[NewTab Sync] 未配置 API Key，跳过同步');
      return;
    }

    const baseUrl = configuredUrl?.endsWith('/api')
      ? configuredUrl
      : getTMarksUrls(configuredUrl || undefined).API_BASE;

    const response = await fetch(`${baseUrl}/tab/newtab/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        shortcuts: data.shortcuts.map((s) => ({
          id: s.id,
          title: s.title,
          url: s.url,
          favicon: s.favicon,
          group_id: s.groupId,
          folder_id: s.folderId,
          position: s.position,
        })),
        groups: data.groups.map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          position: g.position,
        })),
        folders: data.folders.map((f) => ({
          id: f.id,
          name: f.name,
          icon: f.icon,
          group_id: f.groupId,
          position: f.position,
        })),
        settings: {
          columns: data.settings.shortcutColumns,
          style: data.settings.shortcutStyle,
          showTitle: true,
          backgroundType: data.settings.wallpaper.type,
          backgroundValue: data.settings.wallpaper.value,
          backgroundBlur: data.settings.wallpaper.blur,
          backgroundDim: data.settings.wallpaper.brightness,
          showSearch: data.settings.showSearch,
          showClock: data.settings.showClock,
          showPinnedBookmarks: data.settings.showPinnedBookmarks,
          searchEngine: data.settings.searchEngine,
        },
        gridItems: data.gridItems.map((item) => ({
          id: item.id,
          type: item.type,
          size: item.size,
          position: item.position,
          group_id: item.groupId,
          shortcut: item.shortcut,
          config: item.config,
        })),
      }),
    });

    if (response.ok) {
      console.log('[NewTab Sync] 数据已同步到后端');
    } else {
      console.warn('[NewTab Sync] 同步失败:', response.status);
    }
  } catch (error) {
    // 静默失败，不影响本地操作
    console.warn('[NewTab Sync] 同步失败:', error);
  }
}

// 防抖同步（避免频繁请求）
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSync(data: {
  shortcuts: Shortcut[];
  groups: ShortcutGroup[];
  folders: ShortcutFolder[];
  settings: NewTabSettings;
  gridItems: GridItem[];
}) {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(() => {
    syncNewtabToBackend(data);
  }, 2000); // 2秒防抖
}

interface NewTabState {
  // 数据
  shortcuts: Shortcut[];
  shortcutGroups: ShortcutGroup[];
  shortcutFolders: ShortcutFolder[];
  activeGroupId: string | null;
  settings: NewTabSettings;
  isLoading: boolean;
  gridItems: GridItem[];
  currentFolderId: string | null;
  browserBookmarksRootId: string | null;
  isApplyingBrowserBookmarks: boolean;
  browserBookmarkWriteLockUntil: number;
  
  // Actions
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  
  // 快捷方式操作
  addShortcut: (shortcut: Omit<Shortcut, 'id' | 'position' | 'createdAt' | 'clickCount'>) => void;
  updateShortcut: (id: string, updates: Partial<Shortcut>) => void;
  removeShortcut: (id: string) => void;
  reorderShortcuts: (fromIndex: number, toIndex: number) => void;
  incrementClickCount: (id: string) => void;
  
  // 分组操作
  setActiveGroup: (groupId: string | null) => void;
  addGroup: (name: string, icon: string) => void;
  updateGroup: (id: string, updates: Partial<ShortcutGroup>) => void;
  removeGroup: (id: string) => void;
  getFilteredShortcuts: () => Shortcut[];
  
  // 文件夹操作
  addFolder: (name: string, groupId?: string) => string;
  updateFolder: (id: string, updates: Partial<ShortcutFolder>) => void;
  removeFolder: (id: string) => void;
  getFolderShortcuts: (folderId: string) => Shortcut[];
  moveShortcutToFolder: (shortcutId: string, folderId: string | undefined) => void;
  
  // 设置操作
  updateSettings: (updates: Partial<NewTabSettings>) => void;

  // 网格项操作
  addGridItem: (
    type: GridItemType,
    options?: {
      size?: GridItemSize;
      groupId?: string;
      shortcut?: GridItem['shortcut'];
      bookmarkFolder?: GridItem['bookmarkFolder'];
      parentId?: string | null;
    }
  ) => void;
  updateGridItem: (id: string, updates: Partial<GridItem>) => void;
  removeGridItem: (id: string) => void;
  reorderGridItems: (fromIndex: number, toIndex: number) => void;
  getFilteredGridItems: () => GridItem[];
  migrateToGridItems: () => void;
  setCurrentFolderId: (folderId: string | null) => void;
  moveGridItemToFolder: (id: string, folderId: string | null) => void;
  reorderGridItemsInCurrentScope: (activeId: string, overId: string) => void;
  setBrowserBookmarksRootId: (rootId: string | null) => void;
  setIsApplyingBrowserBookmarks: (isApplying: boolean) => void;
  setBrowserBookmarkWriteLockUntil: (until: number) => void;
  replaceBrowserBookmarkGridItems: (items: GridItem[]) => void;
}

// 生成唯一 ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useNewtabStore = create<NewTabState>((set, get) => ({
  shortcuts: [],
  shortcutGroups: DEFAULT_GROUPS,
  shortcutFolders: [],
  activeGroupId: 'home', // 默认选中首页
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  gridItems: [],
  currentFolderId: null,
  browserBookmarksRootId: null,
  isApplyingBrowserBookmarks: false,
  browserBookmarkWriteLockUntil: 0,
  
  loadData: async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const data = result[STORAGE_KEY] as NewTabStorage | undefined;
      
      // 确保分组数据有效
      const groups = data?.shortcutGroups?.length ? data.shortcutGroups : DEFAULT_GROUPS;
      
      // 验证 activeGroupId 是否有效，如果无效则使用第一个分组
      let activeGroupId = data?.activeGroupId;
      if (!activeGroupId || !groups.some(g => g.id === activeGroupId)) {
        activeGroupId = groups[0]?.id || 'home';
      }
      
      // 合并设置，确保新增的设置项有默认值
      const settings = { ...DEFAULT_SETTINGS, ...(data?.settings || {}) };
      
      set({
        shortcuts: data?.shortcuts || [],
        shortcutGroups: groups,
        shortcutFolders: data?.shortcutFolders || [],
        activeGroupId,
        settings,
        gridItems: data?.gridItems || [],
        currentFolderId: null,
        browserBookmarksRootId: null,
        isApplyingBrowserBookmarks: false,
        browserBookmarkWriteLockUntil: 0,
        isLoading: false,
      });
      
      // 如果是首次加载（没有数据），保存默认数据
      if (!data) {
        const { saveData } = get();
        saveData();
      }
    } catch (error) {
      console.error('Failed to load newtab data:', error);
      set({ isLoading: false });
    }
  },
  
  saveData: async () => {
    const { shortcuts, shortcutGroups, shortcutFolders, activeGroupId, settings, gridItems } = get();
    const data: NewTabStorage = { shortcuts, shortcutGroups, shortcutFolders, activeGroupId, settings, gridItems };
    
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch (error) {
      console.error('Failed to save newtab data:', error);
    }
  },
  
  addShortcut: (shortcut) => {
    const { shortcuts, shortcutGroups, settings, gridItems, saveData } = get();
    const newShortcut: Shortcut = {
      ...shortcut,
      id: generateId(),
      position: shortcuts.length,
      createdAt: Date.now(),
      clickCount: 0,
    };

    const newShortcuts = [...shortcuts, newShortcut];
    set({ shortcuts: newShortcuts });
    saveData();

    // 异步下载并缓存 favicon
    (async () => {
      try {
        const { downloadFavicon } = await import('../utils/favicon');
        const base64 = await downloadFavicon(newShortcut.url);
        if (base64) {
          const { updateShortcut } = get();
          updateShortcut(newShortcut.id, { faviconBase64: base64 });
        }
      } catch (error) {
        console.error('Failed to cache favicon:', error);
      }
    })();

    // 异步同步到后端（防抖）
    const { shortcutFolders } = get();
    debouncedSync({ shortcuts: newShortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems });
  },
  
  updateShortcut: (id, updates) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newShortcuts = shortcuts.map((s) => (s.id === id ? { ...s, ...updates } : s));
    set({ shortcuts: newShortcuts });
    saveData();
    debouncedSync({ shortcuts: newShortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems });
  },

  removeShortcut: (id) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const filtered = shortcuts.filter((s) => s.id !== id);
    const reordered = filtered.map((s, index) => ({ ...s, position: index }));
    set({ shortcuts: reordered });
    saveData();
    debouncedSync({ shortcuts: reordered, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems });
  },

  reorderShortcuts: (fromIndex, toIndex) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newShortcuts = [...shortcuts];
    const [removed] = newShortcuts.splice(fromIndex, 1);
    newShortcuts.splice(toIndex, 0, removed);
    const reordered = newShortcuts.map((s, index) => ({ ...s, position: index }));
    set({ shortcuts: reordered });
    saveData();
    debouncedSync({ shortcuts: reordered, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems });
  },
  
  incrementClickCount: (id) => {
    const { shortcuts, saveData } = get();
    set({
      shortcuts: shortcuts.map((s) =>
        s.id === id ? { ...s, clickCount: s.clickCount + 1 } : s
      ),
    });
    saveData();
  },
  
  updateSettings: (updates) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newSettings = { ...settings, ...updates };
    set({ settings: newSettings });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings: newSettings, gridItems });
  },

  // 分组操作
  setActiveGroup: (groupId) => {
    const { saveData } = get();
    set({ activeGroupId: groupId });
    saveData();
    // 不需要同步 activeGroupId，这是本地状态
  },

  addGroup: (name, icon) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newGroup: ShortcutGroup = {
      id: generateId(),
      name,
      icon,
      position: shortcutGroups.length,
    };
    const newGroups = [...shortcutGroups, newGroup];
    set({ shortcutGroups: newGroups });
    saveData();
    debouncedSync({ shortcuts, groups: newGroups, folders: shortcutFolders, settings, gridItems });
  },

  updateGroup: (id, updates) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newGroups = shortcutGroups.map((g) => (g.id === id ? { ...g, ...updates } : g));
    set({ shortcutGroups: newGroups });
    saveData();
    debouncedSync({ shortcuts, groups: newGroups, folders: shortcutFolders, settings, gridItems });
  },

  removeGroup: (id) => {
    const { shortcutGroups, shortcutFolders, shortcuts, activeGroupId, settings, gridItems, saveData } = get();
    // 不允许删除首页分组
    if (id === 'home') {
      console.warn('不能删除首页分组');
      return;
    }
    // 删除分组时，将该分组的快捷方式移到首页
    const updatedShortcuts = shortcuts.map((s) =>
      s.groupId === id ? { ...s, groupId: 'home' } : s
    );
    const filtered = shortcutGroups.filter((g) => g.id !== id);
    set({
      shortcutGroups: filtered,
      shortcuts: updatedShortcuts,
      activeGroupId: activeGroupId === id ? 'home' : activeGroupId,
    });
    saveData();
    debouncedSync({ shortcuts: updatedShortcuts, groups: filtered, folders: shortcutFolders, settings, gridItems });
  },
  
  getFilteredShortcuts: () => {
    const { shortcuts, activeGroupId } = get();
    // 如果没有选中分组，默认显示首页分组
    const targetGroupId = activeGroupId ?? 'home';
    // 只返回不在文件夹内的快捷方式
    return shortcuts.filter((s) => s.groupId === targetGroupId && !s.folderId);
  },

  // 文件夹操作
  addFolder: (name, groupId) => {
    const { shortcuts, shortcutGroups, shortcutFolders, activeGroupId, settings, gridItems, saveData } = get();
    const newFolder: ShortcutFolder = {
      id: generateId(),
      name,
      position: shortcutFolders.length,
      groupId: groupId ?? activeGroupId ?? undefined,
      createdAt: Date.now(),
    };
    const newFolders = [...shortcutFolders, newFolder];
    set({ shortcutFolders: newFolders });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: newFolders, settings, gridItems });
    return newFolder.id;
  },

  updateFolder: (id, updates) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newFolders = shortcutFolders.map((f) => (f.id === id ? { ...f, ...updates } : f));
    set({ shortcutFolders: newFolders });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: newFolders, settings, gridItems });
  },

  removeFolder: (id) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    // 删除文件夹时，将文件夹内的快捷方式移出
    const updatedShortcuts = shortcuts.map((s) =>
      s.folderId === id ? { ...s, folderId: undefined } : s
    );
    const filtered = shortcutFolders.filter((f) => f.id !== id);
    set({ shortcutFolders: filtered, shortcuts: updatedShortcuts });
    saveData();
    debouncedSync({ shortcuts: updatedShortcuts, groups: shortcutGroups, folders: filtered, settings, gridItems });
  },

  getFolderShortcuts: (folderId) => {
    const { shortcuts } = get();
    return shortcuts.filter((s) => s.folderId === folderId);
  },

  moveShortcutToFolder: (shortcutId, folderId) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newShortcuts = shortcuts.map((s) =>
      s.id === shortcutId ? { ...s, folderId } : s
    );
    set({ shortcuts: newShortcuts });
    saveData();
    debouncedSync({ shortcuts: newShortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems });
  },

  // 网格项操作
  addGridItem: (type, options = {}) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, activeGroupId, currentFolderId, saveData } = get();
    const meta = getWidgetMeta(type);
    const defaultConfig = getDefaultWidgetConfig(type);
    
    const newItem: GridItem = {
      id: generateId(),
      type,
      size: options.size || meta.sizeConfig.defaultSize,
      position: gridItems.length,
      groupId: options.groupId ?? activeGroupId ?? undefined,
      parentId: (options.parentId ?? currentFolderId) ?? undefined,
      shortcut: options.shortcut,
      bookmarkFolder: options.bookmarkFolder,
      config: type !== 'shortcut' ? defaultConfig : undefined,
      createdAt: Date.now(),
    };

    const newGridItems = [...gridItems, newItem];
    set({ gridItems: newGridItems });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems: newGridItems });

    const { isApplyingBrowserBookmarks, browserBookmarksRootId } = get();
    if (!isApplyingBrowserBookmarks && browserBookmarksRootId && (type === 'shortcut' || type === 'bookmarkFolder')) {
      (async () => {
        try {
          const state = get();
          const parentGrid = newItem.parentId
            ? state.gridItems.find((i) => i.id === newItem.parentId)
            : null;

          const parentBookmarkId = parentGrid?.browserBookmarkId || state.browserBookmarksRootId;
          if (!parentBookmarkId) return;

          state.setBrowserBookmarkWriteLockUntil(Date.now() + 800);

          if (type === 'bookmarkFolder') {
            const created = await chrome.bookmarks.create({
              parentId: parentBookmarkId,
              title: newItem.bookmarkFolder?.title || '文件夹',
            });

            set({
              gridItems: get().gridItems.map((i) =>
                i.id === newItem.id ? { ...i, browserBookmarkId: created.id } : i
              ),
            });
            state.saveData();
          }

          if (type === 'shortcut' && newItem.shortcut?.url) {
            const created = await chrome.bookmarks.create({
              parentId: parentBookmarkId,
              title: newItem.shortcut.title,
              url: newItem.shortcut.url,
            });

            set({
              gridItems: get().gridItems.map((i) =>
                i.id === newItem.id ? { ...i, browserBookmarkId: created.id } : i
              ),
            });
            state.saveData();
          }
        } catch (e) {
          console.warn('[NewTab] Failed to create browser bookmark:', e);
        }
      })();
    }

    // 如果是快捷方式类型，异步下载并缓存 favicon
    if (type === 'shortcut' && options.shortcut?.url) {
      (async () => {
        try {
          const { downloadFavicon } = await import('../utils/favicon');
          const base64 = await downloadFavicon(options.shortcut!.url);
          if (base64) {
            const { updateGridItem } = get();
            updateGridItem(newItem.id, {
              shortcut: {
                ...options.shortcut!,
                faviconBase64: base64,
              },
            });
          }
        } catch (error) {
          console.error('Failed to cache favicon for grid item:', error);
        }
      })();
    }
  },

  updateGridItem: (id, updates) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newGridItems = gridItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    set({ gridItems: newGridItems });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems: newGridItems });

    const { isApplyingBrowserBookmarks } = get();
    const target = gridItems.find((i) => i.id === id);
    if (!isApplyingBrowserBookmarks && target?.browserBookmarkId) {
      if (target.type === 'bookmarkFolder' && updates.bookmarkFolder?.title) {
        (async () => {
          try {
            get().setBrowserBookmarkWriteLockUntil(Date.now() + 800);
            await chrome.bookmarks.update(target.browserBookmarkId!, { title: updates.bookmarkFolder!.title });
          } catch (e) {
            console.warn('[NewTab] Failed to update browser folder:', e);
          }
        })();
      }

      if (target.type === 'shortcut' && updates.shortcut) {
        (async () => {
          try {
            get().setBrowserBookmarkWriteLockUntil(Date.now() + 800);
            await chrome.bookmarks.update(target.browserBookmarkId!, {
              title: updates.shortcut?.title,
              url: updates.shortcut?.url,
            });
          } catch (e) {
            console.warn('[NewTab] Failed to update browser bookmark:', e);
          }
        })();
      }
    }
  },

  removeGridItem: (id) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, currentFolderId, saveData } = get();

    const target = gridItems.find((i) => i.id === id);
    if (!target) return;

    let toDelete = new Set<string>([id]);

    if (target.type === 'bookmarkFolder') {
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of gridItems) {
          const parentId = item.parentId;
          if (parentId && toDelete.has(parentId) && !toDelete.has(item.id)) {
            toDelete.add(item.id);
            changed = true;
          }
        }
      }
    }

    const filtered = gridItems.filter((item) => !toDelete.has(item.id));

    const targetGroupId = target.groupId;
    const targetParentId = target.parentId ?? null;
    const siblings = filtered
      .filter(
        (item) =>
          item.groupId === targetGroupId && (item.parentId ?? null) === targetParentId
      )
      .sort((a, b) => a.position - b.position);

    const siblingPosById = new Map(siblings.map((item, index) => [item.id, index] as const));
    const reordered = filtered.map((item) => {
      const nextPos = siblingPosById.get(item.id);
      return nextPos === undefined ? item : { ...item, position: nextPos };
    });

    const nextCurrentFolderId = currentFolderId && toDelete.has(currentFolderId) ? null : currentFolderId;
    set({ gridItems: reordered, currentFolderId: nextCurrentFolderId });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems: reordered });

    const { isApplyingBrowserBookmarks } = get();
    if (!isApplyingBrowserBookmarks) {
      const bookmarkIdsToDelete: string[] = [];
      for (const item of gridItems) {
        if (toDelete.has(item.id) && item.browserBookmarkId) {
          bookmarkIdsToDelete.push(item.browserBookmarkId);
        }
      }

      if (bookmarkIdsToDelete.length > 0) {
        (async () => {
          try {
            get().setBrowserBookmarkWriteLockUntil(Date.now() + 1200);
            for (const bid of bookmarkIdsToDelete) {
              try {
                await chrome.bookmarks.removeTree(bid);
              } catch {
                try {
                  await chrome.bookmarks.remove(bid);
                } catch {
                  // ignore
                }
              }
            }
          } catch (e) {
            console.warn('[NewTab] Failed to remove browser bookmark(s):', e);
          }
        })();
      }
    }
  },

  reorderGridItems: (fromIndex, toIndex) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const newGridItems = [...gridItems];
    const [removed] = newGridItems.splice(fromIndex, 1);
    newGridItems.splice(toIndex, 0, removed);
    const reordered = newGridItems.map((item, index) => ({ ...item, position: index }));
    set({ gridItems: reordered });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems: reordered });
  },

  getFilteredGridItems: () => {
    const { gridItems, activeGroupId, currentFolderId } = get();
    // 如果没有选中分组，默认显示首页分组
    const targetGroupId = activeGroupId ?? 'home';
    return gridItems.filter((item) => {
      const inGroup = item.groupId === targetGroupId;
      const inFolder = (item.parentId ?? null) === (currentFolderId ?? null);
      return inGroup && inFolder;
    });
  },

  setCurrentFolderId: (folderId) => {
    set({ currentFolderId: folderId });
  },

  moveGridItemToFolder: (id, folderId) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, saveData } = get();
    const moving = gridItems.find((i) => i.id === id);
    if (!moving) return;

    const targetParentId = folderId ?? null;
    const targetGroupId = moving.groupId;

    const targetScope = gridItems
      .filter(
        (item) =>
          item.id !== id &&
          item.groupId === targetGroupId &&
          (item.parentId ?? null) === targetParentId
      )
      .sort((a, b) => a.position - b.position);

    const nextPosition = targetScope.length;

    const newGridItems = gridItems.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        parentId: targetParentId ?? undefined,
        position: nextPosition,
      };
    });
    set({ gridItems: newGridItems });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems: newGridItems });

    const state = get();
    if (!state.isApplyingBrowserBookmarks && state.browserBookmarksRootId && moving.browserBookmarkId) {
      (async () => {
        try {
          const targetParentGrid = folderId ? state.gridItems.find((i) => i.id === folderId) : null;
          const targetParentBookmarkId = targetParentGrid?.browserBookmarkId || state.browserBookmarksRootId;
          if (!targetParentBookmarkId) return;

          state.setBrowserBookmarkWriteLockUntil(Date.now() + 800);
          await chrome.bookmarks.move(moving.browserBookmarkId!, {
            parentId: targetParentBookmarkId,
            index: nextPosition,
          });
        } catch (e) {
          console.warn('[NewTab] Failed to move browser bookmark:', e);
        }
      })();
    }
  },

  reorderGridItemsInCurrentScope: (activeId, overId) => {
    const { shortcuts, shortcutGroups, shortcutFolders, settings, gridItems, activeGroupId, currentFolderId, saveData } = get();
    const targetGroupId = activeGroupId ?? 'home';
    const scopeItems = gridItems
      .filter((item) => item.groupId === targetGroupId && (item.parentId ?? null) === (currentFolderId ?? null))
      .sort((a, b) => a.position - b.position);

    const fromIndex = scopeItems.findIndex((i) => i.id === activeId);
    const toIndex = scopeItems.findIndex((i) => i.id === overId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const reorderedScope = [...scopeItems];
    const [removed] = reorderedScope.splice(fromIndex, 1);
    reorderedScope.splice(toIndex, 0, removed);

    const positionById = new Map(reorderedScope.map((item, index) => [item.id, index] as const));
    const newGridItems = gridItems.map((item) => {
      const nextPos = positionById.get(item.id);
      return nextPos === undefined ? item : { ...item, position: nextPos };
    });

    set({ gridItems: newGridItems });
    saveData();
    debouncedSync({ shortcuts, groups: shortcutGroups, folders: shortcutFolders, settings, gridItems: newGridItems });
  },

  setBrowserBookmarksRootId: (rootId) => {
    set({ browserBookmarksRootId: rootId });
  },

  setIsApplyingBrowserBookmarks: (isApplying) => {
    set({ isApplyingBrowserBookmarks: isApplying });
  },

  setBrowserBookmarkWriteLockUntil: (until) => {
    set({ browserBookmarkWriteLockUntil: until });
  },

  replaceBrowserBookmarkGridItems: (items) => {
    const { gridItems, saveData } = get();
    const preserved = gridItems.filter((i) => !i.browserBookmarkId);
    const next = [...preserved, ...items];
    set({ gridItems: next });
    saveData();
  },

  // 数据迁移：将旧的 shortcuts 迁移到 gridItems
  migrateToGridItems: () => {
    const { shortcuts, gridItems, saveData } = get();
    
    // 如果没有 shortcuts，不需要迁移
    if (shortcuts.length === 0) return;

    // 找出尚未迁移的快捷方式
    const existingShortcutIds = new Set(
      gridItems
        .filter(item => item.type === 'shortcut' && item.shortcut)
        .map(item => item.id)
    );

    const newShortcuts = shortcuts.filter(s => !existingShortcutIds.has(s.id));
    
    if (newShortcuts.length === 0) return;

    // 迁移新的快捷方式
    const migratedItems: GridItem[] = newShortcuts.map((shortcut, index) => ({
      id: shortcut.id,
      type: 'shortcut' as GridItemType,
      size: '1x1' as GridItemSize,
      position: gridItems.length + index,
      groupId: shortcut.groupId,
      shortcut: {
        url: shortcut.url,
        title: shortcut.title,
        favicon: shortcut.favicon,
      },
      createdAt: shortcut.createdAt,
    }));

    const newGridItems = [...gridItems, ...migratedItems];
    set({ gridItems: newGridItems });
    saveData();
    console.log('[NewTab] 已迁移', migratedItems.length, '个快捷方式到网格系统');
  },



  // 清空所有网格项
}));
