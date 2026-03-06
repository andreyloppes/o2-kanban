"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, KanbanSquare, ChevronLeft, LogOut, BarChart3, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";
import useUIStore from "@/stores/useUIStore";
import useUserStore from "@/stores/useUserStore";

export default function Sidebar() {
    const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);
    const pathname = usePathname();

    const boardTasksPanelOpen = useUIStore((state) => state.boardTasksPanelOpen);
    const toggleBoardTasksPanel = useUIStore((state) => state.toggleBoardTasksPanel);

    const isDashboard = pathname === '/dashboard';
    const isInsideBoard = pathname.startsWith("/board/");
    const isBoards = pathname === "/" || (pathname.startsWith("/board") && !pathname.startsWith("/dashboard"));
    const isSettings = pathname === "/settings";
    const isTasks = pathname === "/tasks";

    const handleSignOut = () => {
        useUserStore.getState().signOut();
    };

    return (
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Menu lateral">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon" aria-hidden="true">
                        <KanbanSquare size={20} color="#10b981" />
                    </div>
                    {!sidebarCollapsed && <span className="logo-text">O2 Kanban</span>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                    title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            <nav className="sidebar-nav" aria-label="Navegacao principal">
                <Link
                    href="/"
                    className={`nav-item ${isBoards ? 'active' : ''}`}
                    aria-current={isBoards ? "page" : undefined}
                    title={sidebarCollapsed ? "Meus Quadros" : undefined}
                >
                    {isBoards && (
                        <motion.div
                            className="nav-indicator"
                            layoutId="nav-indicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                    <LayoutDashboard size={18} />
                    <span>Meus Quadros</span>
                </Link>
                <Link
                    href="/tasks"
                    className={`nav-item ${isTasks ? 'active' : ''}`}
                    aria-current={isTasks ? "page" : undefined}
                    title={sidebarCollapsed ? "Tarefas" : undefined}
                >
                    {isTasks && (
                        <motion.div
                            className="nav-indicator"
                            layoutId="nav-indicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                    <CheckSquare size={18} />
                    <span>Tarefas</span>
                </Link>
                <Link
                    href="/dashboard"
                    className={`nav-item ${isDashboard ? 'active' : ''}`}
                    aria-current={isDashboard ? "page" : undefined}
                    title={sidebarCollapsed ? "Dashboard" : undefined}
                >
                    {isDashboard && (
                        <motion.div
                            className="nav-indicator"
                            layoutId="nav-indicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                    <BarChart3 size={18} />
                    <span>Dashboard</span>
                </Link>
                <Link
                    href="/settings"
                    className={`nav-item ${isSettings ? 'active' : ''}`}
                    aria-current={isSettings ? "page" : undefined}
                    title={sidebarCollapsed ? "Configuracoes" : undefined}
                >
                    {isSettings && (
                        <motion.div
                            className="nav-indicator"
                            layoutId="nav-indicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                    <Settings size={18} />
                    <span>Configuracoes</span>
                </Link>
                {isInsideBoard && (
                    <>
                        <div className="sidebar-divider" />
                        <button
                            className={`nav-item-button ${boardTasksPanelOpen ? 'active' : ''}`}
                            onClick={toggleBoardTasksPanel}
                            title={sidebarCollapsed ? "Tarefas" : undefined}
                        >
                            {boardTasksPanelOpen && (
                                <motion.div
                                    className="nav-indicator"
                                    layoutId="nav-indicator-tasks"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <CheckSquare size={18} />
                            <span>Tarefas</span>
                        </button>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <button
                    className="nav-item"
                    onClick={handleSignOut}
                    title={sidebarCollapsed ? "Sair" : undefined}
                >
                    <LogOut size={18} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
}
