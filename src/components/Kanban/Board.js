import { TEAM_MEMBERS } from "@/lib/constants";

export default function Board({ title, children }) {
  const visibleMembers = TEAM_MEMBERS.slice(0, 4);
  const extraCount = Math.max(0, TEAM_MEMBERS.length - 4);

  return (
    <main className="main-area">
      <header className="board-header">
        <div className="header-left">
          <h1 className="header-title">{title}</h1>
        </div>

        <div className="header-right">
          <div className="avatar-group" role="group" aria-label="Membros do time">
            {visibleMembers.map((member) => (
              <div key={member.id} className="header-avatar" title={member.name}>
                {member.name.charAt(0)}
              </div>
            ))}
            {extraCount > 0 && (
              <div className="header-avatar avatar-more" title={`Mais ${extraCount} membros`}>
                +{extraCount}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="board-content">
        {children}
      </div>
    </main>
  );
}
