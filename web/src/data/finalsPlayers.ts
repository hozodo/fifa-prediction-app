export type FinalistTeam = 'ARG' | 'ESP';

export interface FinalistPlayer {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  team: FinalistTeam;
}

export const FINALIST_TEAMS: Record<
  FinalistTeam,
  { code: FinalistTeam; name: string }
> = {
  ARG: { code: 'ARG', name: 'Argentina' },
  ESP: { code: 'ESP', name: 'Spain' },
};

// FIFA World Cup 2026 Final — July 19, MetLife Stadium: Argentina vs Spain
export const FINALIST_PLAYERS: FinalistPlayer[] = [
  // Argentina
  { id: 'arg-martinez-e', name: 'Emiliano Martínez', position: 'GK', team: 'ARG' },
  { id: 'arg-rulli', name: 'Gerónimo Rulli', position: 'GK', team: 'ARG' },
  { id: 'arg-musso', name: 'Juan Musso', position: 'GK', team: 'ARG' },
  { id: 'arg-montiel', name: 'Gonzalo Montiel', position: 'DEF', team: 'ARG' },
  { id: 'arg-molina', name: 'Nahuel Molina', position: 'DEF', team: 'ARG' },
  { id: 'arg-martinez-l', name: 'Lisandro Martínez', position: 'DEF', team: 'ARG' },
  { id: 'arg-otamendi', name: 'Nicolás Otamendi', position: 'DEF', team: 'ARG' },
  { id: 'arg-balerdi', name: 'Leonardo Balerdi', position: 'DEF', team: 'ARG' },
  { id: 'arg-romero', name: 'Cristian Romero', position: 'DEF', team: 'ARG' },
  { id: 'arg-tagliafico', name: 'Nicolás Tagliafico', position: 'DEF', team: 'ARG' },
  { id: 'arg-medina', name: 'Facundo Medina', position: 'DEF', team: 'ARG' },
  { id: 'arg-locelso', name: 'Giovani Lo Celso', position: 'MID', team: 'ARG' },
  { id: 'arg-paredes', name: 'Leandro Paredes', position: 'MID', team: 'ARG' },
  { id: 'arg-depaul', name: 'Rodrigo De Paul', position: 'MID', team: 'ARG' },
  { id: 'arg-palacios', name: 'Exequiel Palacios', position: 'MID', team: 'ARG' },
  { id: 'arg-fernandez', name: 'Enzo Fernández', position: 'MID', team: 'ARG' },
  { id: 'arg-macallister', name: 'Alexis Mac Allister', position: 'MID', team: 'ARG' },
  { id: 'arg-barco', name: 'Valentín Barco', position: 'MID', team: 'ARG' },
  { id: 'arg-messi', name: 'Lionel Messi', position: 'FWD', team: 'ARG' },
  { id: 'arg-gonzalez', name: 'Nicolás González', position: 'FWD', team: 'ARG' },
  { id: 'arg-simeone', name: 'Giuliano Simeone', position: 'FWD', team: 'ARG' },
  { id: 'arg-martinez-lau', name: 'Lautaro Martínez', position: 'FWD', team: 'ARG' },
  { id: 'arg-lopez', name: "José Manuel López", position: 'FWD', team: 'ARG' },
  { id: 'arg-alvarez', name: 'Julián Álvarez', position: 'FWD', team: 'ARG' },
  { id: 'arg-almada', name: 'Thiago Almada', position: 'FWD', team: 'ARG' },
  { id: 'arg-paz', name: 'Nico Paz', position: 'FWD', team: 'ARG' },

  // Spain
  { id: 'esp-simon', name: 'Unai Simón', position: 'GK', team: 'ESP' },
  { id: 'esp-raya', name: 'David Raya', position: 'GK', team: 'ESP' },
  { id: 'esp-garcia-j', name: 'Joan García', position: 'GK', team: 'ESP' },
  { id: 'esp-cucurella', name: 'Marc Cucurella', position: 'DEF', team: 'ESP' },
  { id: 'esp-grimaldo', name: 'Alejandro Grimaldo', position: 'DEF', team: 'ESP' },
  { id: 'esp-cubarsi', name: 'Pau Cubarsí', position: 'DEF', team: 'ESP' },
  { id: 'esp-laporte', name: 'Aymeric Laporte', position: 'DEF', team: 'ESP' },
  { id: 'esp-pubill', name: 'Marc Pubill', position: 'DEF', team: 'ESP' },
  { id: 'esp-garcia-e', name: 'Eric García', position: 'DEF', team: 'ESP' },
  { id: 'esp-llorente', name: 'Marcos Llorente', position: 'DEF', team: 'ESP' },
  { id: 'esp-porro', name: 'Pedro Porro', position: 'DEF', team: 'ESP' },
  { id: 'esp-pedri', name: 'Pedri', position: 'MID', team: 'ESP' },
  { id: 'esp-fabianruiz', name: 'Fabián Ruiz', position: 'MID', team: 'ESP' },
  { id: 'esp-zubimendi', name: 'Martín Zubimendi', position: 'MID', team: 'ESP' },
  { id: 'esp-gavi', name: 'Gavi', position: 'MID', team: 'ESP' },
  { id: 'esp-rodri', name: 'Rodri', position: 'MID', team: 'ESP' },
  { id: 'esp-baena', name: 'Álex Baena', position: 'MID', team: 'ESP' },
  { id: 'esp-merino', name: 'Mikel Merino', position: 'MID', team: 'ESP' },
  { id: 'esp-rodri', name: 'Rodrigo Hernández Cascante', position: 'MID', team: 'ESP' },
  { id: 'esp-oyarzabal', name: 'Mikel Oyarzabal', position: 'FWD', team: 'ESP' },
  { id: 'esp-olmo', name: 'Dani Olmo', position: 'FWD', team: 'ESP' },
  { id: 'esp-williams', name: 'Nico Williams', position: 'FWD', team: 'ESP' },
  { id: 'esp-pino', name: 'Yeremy Pino', position: 'FWD', team: 'ESP' },
  { id: 'esp-torres', name: 'Ferran Torres', position: 'FWD', team: 'ESP' },
  { id: 'esp-iglesias', name: 'Borja Iglesias', position: 'FWD', team: 'ESP' },
  { id: 'esp-munoz', name: 'Víctor Muñoz', position: 'FWD', team: 'ESP' },
  { id: 'esp-yamal', name: 'Lamine Yamal', position: 'FWD', team: 'ESP' },
];

