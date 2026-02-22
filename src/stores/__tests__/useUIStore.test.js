import { describe, it, expect, beforeEach } from 'vitest';
import useUIStore from '../useUIStore';

describe('useUIStore - Filters', () => {
  beforeEach(() => {
    useUIStore.setState({
      filters: { type: null, priority: null, assignee: null, search: '' },
    });
  });

  it('inicia com filtros limpos', () => {
    const { filters } = useUIStore.getState();
    expect(filters.type).toBeNull();
    expect(filters.priority).toBeNull();
    expect(filters.assignee).toBeNull();
    expect(filters.search).toBe('');
  });

  it('setFilter atualiza filtro de tipo', () => {
    useUIStore.getState().setFilter('type', 'bug');
    expect(useUIStore.getState().filters.type).toBe('bug');
  });

  it('setFilter atualiza filtro de prioridade', () => {
    useUIStore.getState().setFilter('priority', 'high');
    expect(useUIStore.getState().filters.priority).toBe('high');
  });

  it('setFilter atualiza filtro de assignee', () => {
    useUIStore.getState().setFilter('assignee', 'andrey');
    expect(useUIStore.getState().filters.assignee).toBe('andrey');
  });

  it('setFilter atualiza filtro de search', () => {
    useUIStore.getState().setFilter('search', 'bug fix');
    expect(useUIStore.getState().filters.search).toBe('bug fix');
  });

  it('clearFilters reseta todos os filtros', () => {
    useUIStore.getState().setFilter('type', 'bug');
    useUIStore.getState().setFilter('priority', 'high');
    useUIStore.getState().setFilter('assignee', 'andrey');
    useUIStore.getState().setFilter('search', 'test');
    useUIStore.getState().clearFilters();

    const { filters } = useUIStore.getState();
    expect(filters.type).toBeNull();
    expect(filters.priority).toBeNull();
    expect(filters.assignee).toBeNull();
    expect(filters.search).toBe('');
  });

  it('hasActiveFilters retorna false sem filtros', () => {
    expect(useUIStore.getState().hasActiveFilters()).toBe(false);
  });

  it('hasActiveFilters retorna true com tipo setado', () => {
    useUIStore.getState().setFilter('type', 'bug');
    expect(useUIStore.getState().hasActiveFilters()).toBe(true);
  });

  it('hasActiveFilters retorna true com search preenchida', () => {
    useUIStore.getState().setFilter('search', 'abc');
    expect(useUIStore.getState().hasActiveFilters()).toBe(true);
  });

  it('setFilter com null remove filtro individual', () => {
    useUIStore.getState().setFilter('type', 'bug');
    useUIStore.getState().setFilter('type', null);
    expect(useUIStore.getState().filters.type).toBeNull();
    expect(useUIStore.getState().hasActiveFilters()).toBe(false);
  });
});

describe('useUIStore - Toasts', () => {
  beforeEach(() => {
    useUIStore.setState({ toasts: [] });
  });

  it('addToast adiciona toast com tipo padrão success', () => {
    useUIStore.getState().addToast('Mensagem');
    const toasts = useUIStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Mensagem');
    expect(toasts[0].type).toBe('success');
  });

  it('addToast adiciona toast com tipo error', () => {
    useUIStore.getState().addToast('Erro!', 'error');
    expect(useUIStore.getState().toasts[0].type).toBe('error');
  });

  it('removeToast remove toast por id', () => {
    useUIStore.getState().addToast('Test');
    const id = useUIStore.getState().toasts[0].id;
    useUIStore.getState().removeToast(id);
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });
});

describe('useUIStore - Sidebar & Columns', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarCollapsed: false, collapsedColumns: {} });
  });

  it('toggleSidebar alterna estado', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it('toggleColumn alterna collapse de coluna', () => {
    const colId = 'col-1';
    useUIStore.getState().toggleColumn(colId);
    expect(useUIStore.getState().collapsedColumns[colId]).toBe(true);
    useUIStore.getState().toggleColumn(colId);
    expect(useUIStore.getState().collapsedColumns[colId]).toBe(false);
  });
});

describe('useUIStore - Modals', () => {
  beforeEach(() => {
    useUIStore.setState({
      activeTaskId: null,
      isCreateModalOpen: false,
      createModalColumnId: null,
      confirmDialog: null,
    });
  });

  it('openTaskModal seta activeTaskId', () => {
    useUIStore.getState().openTaskModal('task-123');
    expect(useUIStore.getState().activeTaskId).toBe('task-123');
  });

  it('closeTaskModal reseta activeTaskId', () => {
    useUIStore.getState().openTaskModal('task-123');
    useUIStore.getState().closeTaskModal();
    expect(useUIStore.getState().activeTaskId).toBeNull();
  });

  it('openCreateModal seta columnId e fecha taskModal', () => {
    useUIStore.getState().openTaskModal('task-123');
    useUIStore.getState().openCreateModal('col-abc');
    expect(useUIStore.getState().isCreateModalOpen).toBe(true);
    expect(useUIStore.getState().createModalColumnId).toBe('col-abc');
    expect(useUIStore.getState().activeTaskId).toBeNull();
  });

  it('closeCreateModal reseta estado', () => {
    useUIStore.getState().openCreateModal('col-abc');
    useUIStore.getState().closeCreateModal();
    expect(useUIStore.getState().isCreateModalOpen).toBe(false);
    expect(useUIStore.getState().createModalColumnId).toBeNull();
  });

  it('showConfirmDialog e hideConfirmDialog', () => {
    const onConfirm = () => {};
    useUIStore.getState().showConfirmDialog({
      title: 'Teste',
      message: 'Msg',
      onConfirm,
      confirmLabel: 'OK',
    });
    expect(useUIStore.getState().confirmDialog).toBeTruthy();
    expect(useUIStore.getState().confirmDialog.title).toBe('Teste');

    useUIStore.getState().hideConfirmDialog();
    expect(useUIStore.getState().confirmDialog).toBeNull();
  });
});
