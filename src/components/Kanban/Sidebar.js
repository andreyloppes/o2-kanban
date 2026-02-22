"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, KanbanSquare, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import useUIStore from "@/stores/useUIStore";

export default function Sidebar() {
    const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);
    const pathname = usePathname();

    const isBoards = pathname === "/" || pathname.startsWith("/board");
    const isSettings = pathname === "/settings";

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
            </nav>
        </aside>
    );
}
