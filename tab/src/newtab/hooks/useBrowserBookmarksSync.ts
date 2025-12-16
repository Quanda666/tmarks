import { useEffect, useRef } from 'react';
import { useNewtabStore } from './useNewtabStore';
import type { GridItem, GridItemSize } from '../types';

const ROOT_TITLE = 'AI 书签助手 NewTab';

function isFolder(node: chrome.bookmarks.BookmarkTreeNode) {
  return !node.url;
}

function defaultSizeFor(node: chrome.bookmarks.BookmarkTreeNode): GridItemSize {
  return node.url ? '1x1' : '1x1';
}

async function getBookmarksBarRootId(): Promise<string | null> {
  try {
    const tree = await chrome.bookmarks.getTree();
    const root = tree[0];
    const bar = root.children?.find((c) => c.title === 'Bookmarks Bar' || c.title === '书签栏');
    return bar?.id || null;
  } catch {
    return null;
  }
}

async function ensureRootFolder(): Promise<string | null> {
  const barId = await getBookmarksBarRootId();
  if (!barId) return null;

  const children = await chrome.bookmarks.getChildren(barId);
  const existing = children.find((c) => !c.url && c.title === ROOT_TITLE);
  if (existing) return existing.id;

  const created = await chrome.bookmarks.create({
    parentId: barId,
    title: ROOT_TITLE,
  });
  return created.id;
}

function toGridItems(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  opts: { groupId: string; parentGridId: string | null }
): GridItem[] {
  const items: GridItem[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isFolder(node)) {
      const folderItem: GridItem = {
        id: `bb-${node.id}`,
        type: 'bookmarkFolder',
        size: defaultSizeFor(node),
        position: i,
        groupId: opts.groupId,
        parentId: opts.parentGridId ?? undefined,
        browserBookmarkId: node.id,
        bookmarkFolder: { title: node.title },
        createdAt: Date.now(),
      };

      items.push(folderItem);

      const children = node.children || [];
      items.push(
        ...toGridItems(children, {
          groupId: opts.groupId,
          parentGridId: folderItem.id,
        })
      );

      continue;
    }

    const urlItem: GridItem = {
      id: `bb-${node.id}`,
      type: 'shortcut',
      size: '1x1',
      position: i,
      groupId: opts.groupId,
      parentId: opts.parentGridId ?? undefined,
      browserBookmarkId: node.id,
      shortcut: {
        url: node.url || '',
        title: node.title || node.url || '',
      },
      createdAt: Date.now(),
    };

    items.push(urlItem);
  }

  return items;
}

export function useBrowserBookmarksSync() {
  const {
    browserBookmarkWriteLockUntil,
    setBrowserBookmarksRootId,
    setIsApplyingBrowserBookmarks,
    replaceBrowserBookmarkGridItems,
  } = useNewtabStore();

  const refreshInFlight = useRef(false);

  useEffect(() => {
    let disposed = false;

    const refreshFromBrowser = async () => {
      if (refreshInFlight.current) return;
      refreshInFlight.current = true;

      try {
        const rootId = await ensureRootFolder();
        if (!rootId) return;
        if (disposed) return;

        setBrowserBookmarksRootId(rootId);

        const children = await chrome.bookmarks.getChildren(rootId);
        const groupId = 'home';
        const mapped = toGridItems(children, { groupId, parentGridId: null });

        setIsApplyingBrowserBookmarks(true);
        replaceBrowserBookmarkGridItems(mapped);
      } catch (e) {
        // silent
      } finally {
        setIsApplyingBrowserBookmarks(false);
        refreshInFlight.current = false;
      }
    };

    refreshFromBrowser();

    const handleEvent = () => {
      const now = Date.now();
      if (now < browserBookmarkWriteLockUntil) {
        return;
      }
      refreshFromBrowser();
    };

    chrome.bookmarks.onCreated.addListener(handleEvent);
    chrome.bookmarks.onRemoved.addListener(handleEvent);
    chrome.bookmarks.onChanged.addListener(handleEvent);
    chrome.bookmarks.onMoved.addListener(handleEvent);
    chrome.bookmarks.onChildrenReordered.addListener(handleEvent);

    return () => {
      disposed = true;
      chrome.bookmarks.onCreated.removeListener(handleEvent);
      chrome.bookmarks.onRemoved.removeListener(handleEvent);
      chrome.bookmarks.onChanged.removeListener(handleEvent);
      chrome.bookmarks.onMoved.removeListener(handleEvent);
      chrome.bookmarks.onChildrenReordered.removeListener(handleEvent);
    };
  }, [browserBookmarkWriteLockUntil, replaceBrowserBookmarkGridItems, setBrowserBookmarksRootId, setIsApplyingBrowserBookmarks]);
}
