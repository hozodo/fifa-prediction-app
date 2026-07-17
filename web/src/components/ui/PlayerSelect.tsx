import React from 'react';
import { createPortal } from 'react-dom';
import {
  FINALIST_PLAYERS,
  FINALIST_TEAMS,
  type FinalistPlayer,
} from '../../data/finalsPlayers';

// Import all flags dynamically (same pattern used by MatchCard)
const flagModules: Record<string, string> = import.meta.glob(
  '../../assets/flags/*.png',
  { eager: true, import: 'default' }
);

const getFlag = (code: string): string => {
  return (
    flagModules[`../../assets/flags/${code}.png`] ??
    flagModules['../../assets/flags/UNKNOWN.png']
  );
};

type PlayerSelectProps = {
  value: string | null;
  onChange: (playerId: string) => void;
  disabled?: boolean;
};

type Position = {
  top: number;
  left: number;
  width: number;
};

export const PlayerSelect = ({
  value,
  onChange,
  disabled = false,
}: PlayerSelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState<Position>({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLUListElement>(null);

  const selectedPlayer = FINALIST_PLAYERS.find((p) => p.id === value) ?? null;

  const updatePosition = React.useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // Keep the portal aligned with the button while open (page scroll/resize)
  React.useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close on click outside (button or the portaled dropdown)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideButton =
        buttonRef.current && !buttonRef.current.contains(target);
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);

      if (clickedOutsideButton && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (player: FinalistPlayer) => {
    onChange(player.id);
    setIsOpen(false);
  };

  const groups: Array<{
    code: keyof typeof FINALIST_TEAMS;
    players: FinalistPlayer[];
  }> = [
    {
      code: 'ARG',
      players: FINALIST_PLAYERS.filter((p) => p.team === 'ARG'),
    },
    {
      code: 'ESP',
      players: FINALIST_PLAYERS.filter((p) => p.team === 'ESP'),
    },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 border border-white/20 bg-black/20 backdrop-blur-sm text-white text-left rounded-lg transition-colors ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'
        }`}
      >
        {selectedPlayer ? (
          <>
            <img
              src={getFlag(selectedPlayer.team)}
              alt={FINALIST_TEAMS[selectedPlayer.team].name}
              className="h-5 w-7 object-contain rounded-sm shrink-0"
            />
            <span className="flex-1 font-medium text-sm truncate">
              {selectedPlayer.name}
            </span>
            <span className="text-xs text-white/50 uppercase shrink-0">
              {selectedPlayer.position}
            </span>
          </>
        ) : (
          <span className="flex-1 text-white/50 text-sm">
            Select a player…
          </span>
        )}
        <span
          className={`ml-2 text-white/50 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {isOpen &&
        createPortal(
          <ul
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className="z-50 max-h-80 overflow-y-auto p-2 backdrop-blur-2xl bg-black/90 border border-white/10 rounded-lg shadow-xl"
          >
            {groups.map((group) => (
              <li key={group.code}>
                <div className="flex items-center gap-2 px-2 py-1.5 sticky top-0 bg-black/90 backdrop-blur-2xl">
                  <img
                    src={getFlag(group.code)}
                    alt={FINALIST_TEAMS[group.code].name}
                    className="h-4 w-6 object-contain rounded-sm"
                  />
                  <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    {FINALIST_TEAMS[group.code].name}
                  </span>
                </div>
                <ul>
                  {group.players.map((player) => {
                    const isSelected = player.id === value;
                    return (
                      <li key={player.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(player)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg text-sm transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <img
                            src={getFlag(player.team)}
                            alt={FINALIST_TEAMS[player.team].name}
                            className="h-4 w-6 object-contain rounded-sm shrink-0"
                          />
                          <span className="flex-1 truncate">
                            {player.name}
                          </span>
                          <span className="text-xs text-white/40 uppercase shrink-0">
                            {player.position}
                          </span>
                          {isSelected && <span className="shrink-0">✓</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
};
