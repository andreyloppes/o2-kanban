"use client";

import { LayoutDashboard, Users, Settings, KanbanSquare, ChevronLeft } from "lucide-react";
import useUIStore from "@/stores/useUIStore";

export default function Sidebar() {
    const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
    const toggleSidebar = useUIStore((state) => state.toggleSidebar);

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
                <a
                    href="#"
                    className="nav-item active"
                    aria-current="page"
                    title={sidebarCollapsed ? "Meus Quadros" : undefined}
                >
                    <LayoutDashboard size={18} />
                    <span>Meus Quadros</span>
                </a>
                <a
                    href="#"
                    className="nav-item"
                    title={sidebarCollapsed ? "Usuarios" : undefined}
                >
                    <Users size={18} />
                    <span>Usuarios</span>
                </a>
                <a
                    href="#"
                    className="nav-item"
                    title={sidebarCollapsed ? "Configuracoes" : undefined}
                >
                    <Settings size={18} />
                    <span>Configuracoes</span>
                </a>
            </nav>
        </aside>
    );
}
