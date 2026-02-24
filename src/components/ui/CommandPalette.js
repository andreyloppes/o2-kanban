'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  Layout,
  Settings,
  PlusCircle,
  Filter,
  X,
  Sidebar,
  MessageSquare,
  LayoutDashboard,
  Kanban,
} from 'lucide-react';
import useUIStore from '@/stores/useUIStore';
import styles from './CommandPalette.module.css';

const CATEGORY_ICONS = {
  Navigation: ArrowRight,
  Actions: PlusCircle,
  Filters: Filter,
};

const BADGE_STYLES = {
  Navigation: styles.badgeNavigation,
  Actions: styles.badgeAction,
  Filters: styles.badgeFilter,
};

function buildCommands(boards = []) {
  const commands = [];

  // === Navigation ===
  commands.push({
    id: 'nav-boards',
    name: 'Go to Boards',
    category: 'Navigation',
    icon: Layout,
    action: (router) => router.push('/'),
  });

  commands.push({
    id: 'nav-dashboard',
    name: 'Go to Dashboard',
    category: 'Navigation',
    icon: LayoutDashboard,
    action: (router) => router.push('/dashboard'),
  });

  commands.push({
    id: 'nav-settings',
    name: 'Go to Settings',
    category: 'Navigation',
    icon: Settings,
    action: (router) => router.push('/settings'),
  });

  boards.forEach((board) => {
    commands.push({
      id: `nav-board-${board.id}`,
      name: `Go to Board: ${board.title}`,
      category: 'Navigation',
      icon: Kanban,
      action: (router) => router.push(`/board/${board.id}`),
    });
  });

  // === Actions ===
  commands.push({
    id: 'action-create-task',
    name: 'Create Task',
    category: 'Actions',
    icon: PlusCircle,
    action: () => useUIStore.getState().openCreateModal(),
  });

  commands.push({
    id: 'action-toggle-sidebar',
    name: 'Toggle Sidebar',
    category: 'Actions',
    icon: Sidebar,
    action: () => useUIStore.getState().toggleSidebar(),
  });

  commands.push({
    id: 'action-toggle-ai',
    name: 'Toggle AI Chat',
    category: 'Actions',
    icon: MessageSquare,
    action: () => useUIStore.getState().toggleAIChat(),
  });

  // === Filters ===
  commands.push({
    id: 'filter-high-priority',
    name: 'Filter: High Priority',
    category: 'Filters',
    icon: Filter,
    action: () => useUIStore.getState().setFilter('priority', 'high'),
  });

  commands.push({
    id: 'filter-urgent',
    name: 'Filter: Urgent',
    category: 'Filters',
    icon: Filter,
    action: () => useUIStore.getState().setFilter('priority', 'urgent'),
  });

  commands.push({
    id: 'filter-bugs',
    name: 'Filter: Bugs Only',
    category: 'Filters',
    icon: Filter,
    action: () => useUIStore.getState().setFilter('type', 'bug'),
  });

  commands.push({
    id: 'filter-my-tasks',
    name: 'Filter: My Tasks',
    category: 'Filters',
    icon: Filter,
    action: () => {
      // currentUser slug is read at execution time
      try {
        const { default: useUserStore } = require('@/stores/useUserStore');
        const user = useUserStore.getState().currentUser;
        if (user?.slug) {
          useUIStore.getState().setFilter('assignee', user.slug);
        }
      } catch {
        // store not available — no-op
      }
    },
  });

  commands.push({
    id: 'filter-clear',
    name: 'Clear Filters',
    category: 'Filters',
    icon: X,
    action: () => useUIStore.getState().clearFilters(),
  });

  return commands;
}

function fuzzyMatch(query, text) {
  if (!query) return true;
  return text.toLowerCase().includes(query.toLowerCase());
}

function groupByCategory(items) {
  const groups = {};
  const order = ['Navigation', 'Actions', 'Filters'];

  items.forEach((item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });

  return order
    .filter((cat) => groups[cat]?.length > 0)
    .map((cat) => ({ category: cat, items: groups[cat] }));
}

export default function CommandPalette({ isOpen, onClose, boards = [] }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = useMemo(() => buildCommands(boards), [boards]);

  const filtered = useMemo(() => {
    return commands.filter((cmd) => fuzzyMatch(query, cmd.name));
  }, [commands, query]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    return grouped.flatMap((g) => g.items);
  }, [grouped]);

  // Reset query and selection when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clamp selected index when results change
  useEffect(() => {
    if (selectedIndex >= flatList.length) {
      setSelectedIndex(Math.max(0, flatList.length - 1));
    }
  }, [flatList.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selected = resultsRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (command) => {
      onClose();
      // Execute after closing to avoid state conflicts
      requestAnimationFrame(() => {
        command.action(router);
      });
    },
    [onClose, router]
  );

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatList.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatList.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (flatList[selectedIndex]) {
            executeCommand(flatList[selectedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        default:
          break;
      }
    },
    [flatList, selectedIndex, executeCommand, onClose]
  );

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container} onKeyDown={handleKeyDown}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className={styles.shortcutBadge}>ESC</span>
        </div>

        {/* Results */}
        <div className={styles.results} ref={resultsRef}>
          {flatList.length === 0 ? (
            <div className={styles.empty}>
              <Search size={24} className={styles.emptyIcon} />
              <span>No results found for &ldquo;{query}&rdquo;</span>
            </div>
          ) : (
            grouped.map((group) => {
              return (
                <div key={group.category} className={styles.categoryGroup}>
                  <div className={styles.categoryLabel}>{group.category}</div>
                  {group.items.map((cmd) => {
                    const globalIndex = flatList.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <div
                        key={cmd.id}
                        data-index={globalIndex}
                        className={`${styles.resultItem} ${
                          isSelected ? styles.resultItemSelected : ''
                        }`}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className={styles.resultIcon}>
                          <Icon size={15} />
                        </div>
                        <span className={styles.resultName}>{cmd.name}</span>
                        <span
                          className={`${styles.resultBadge} ${
                            BADGE_STYLES[cmd.category] || ''
                          }`}
                        >
                          {cmd.category}
                        </span>
                        <span className={styles.enterHint}>Enter</span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerHints}>
            <span className={styles.footerHint}>
              <span className={styles.footerKey}>&uarr;</span>
              <span className={styles.footerKey}>&darr;</span>
              navigate
            </span>
            <span className={styles.footerHint}>
              <span className={styles.footerKey}>Enter</span>
              select
            </span>
            <span className={styles.footerHint}>
              <span className={styles.footerKey}>Esc</span>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
