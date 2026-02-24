'use client';

import { useCallback } from 'react';
import { ListFilter, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chipVariants } from '@/lib/motion';
import useUIStore from '@/stores/useUIStore';
import useBoardStore from '@/stores/useBoardStore';
import { TASK_TYPES, TASK_PRIORITIES } from '@/lib/constants';
import SearchBar from '@/components/ui/SearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';
import FilterChip from '@/components/ui/FilterChip';
import SavedViews from '@/components/Kanban/SavedViews';
import styles from './FilterBar.module.css';

const typeOptions = Object.entries(TASK_TYPES).map(([value, label]) => ({
  value,
  label,
}));

const priorityOptions = Object.entries(TASK_PRIORITIES).map(([value, label]) => ({
  value,
  label,
}));

export default function FilterBar() {
  const filters = useUIStore((state) => state.filters);
  const members = useBoardStore((state) => state.members);

  const assigneeOptions = [
    ...members
      .filter((m) => m.user)
      .map((m) => ({ value: m.user.slug, label: m.user.name })),
    { value: '__unassigned__', label: 'Sem responsavel' },
  ];
  const hasActiveFilters = useUIStore((state) => state.hasActiveFilters());

  const handleSearchChange = useCallback((value) => {
    useUIStore.getState().setFilter('search', value);
  }, []);

  const handleTypeChange = useCallback((value) => {
    useUIStore.getState().setFilter('type', value);
  }, []);

  const handlePriorityChange = useCallback((value) => {
    useUIStore.getState().setFilter('priority', value);
  }, []);

  const handleAssigneeChange = useCallback((value) => {
    useUIStore.getState().setFilter('assignee', value);
  }, []);

  const handleClearAll = useCallback(() => {
    useUIStore.getState().clearFilters();
  }, []);

  // Mapeamento de filtros ativos para chips
  const activeChips = [];
  if (filters.type) {
    activeChips.push({
      key: 'type',
      category: 'Tipo',
      label: TASK_TYPES[filters.type] || filters.type,
      onRemove: () => useUIStore.getState().setFilter('type', null),
    });
  }
  if (filters.priority) {
    activeChips.push({
      key: 'priority',
      category: 'Prioridade',
      label: TASK_PRIORITIES[filters.priority] || filters.priority,
      onRemove: () => useUIStore.getState().setFilter('priority', null),
    });
  }
  if (filters.assignee) {
    const member = members.find((m) => m.user?.slug === filters.assignee);
    activeChips.push({
      key: 'assignee',
      category: 'Responsavel',
      label: filters.assignee === '__unassigned__' ? 'Sem responsavel' : (member?.user?.name || filters.assignee),
      onRemove: () => useUIStore.getState().setFilter('assignee', null),
    });
  }

  return (
    <div className={styles.filterBar}>
      <div className={styles.controls}>
        <SearchBar
          value={filters.search}
          onChange={handleSearchChange}
        />
        <FilterDropdown
          label="Tipo"
          icon={<ListFilter size={14} />}
          options={typeOptions}
          selected={filters.type}
          onChange={handleTypeChange}
        />
        <FilterDropdown
          label="Prioridade"
          icon={<AlertTriangle size={14} />}
          options={priorityOptions}
          selected={filters.priority}
          onChange={handlePriorityChange}
        />
        <FilterDropdown
          label="Responsável"
          icon={<Users size={14} />}
          options={assigneeOptions}
          selected={filters.assignee}
          onChange={handleAssigneeChange}
        />
        <SavedViews />
      </div>

      {hasActiveFilters && (
        <div className={styles.activeFilters}>
          <div className={styles.chips}>
            <AnimatePresence mode="popLayout">
              {activeChips.map((chip) => (
                <motion.div
                  key={chip.key}
                  variants={chipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <FilterChip
                    label={chip.label}
                    category={chip.category}
                    onRemove={chip.onRemove}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={handleClearAll}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
