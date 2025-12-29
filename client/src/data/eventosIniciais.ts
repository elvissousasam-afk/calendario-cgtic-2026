// Eventos iniciais para popular o calendário
export const eventosIniciais = [
  {
    id: 1,
    titulo: "Revisão de Contratos de TI",
    dataInicio: "2026-01-20T14:00:00",
    dataFim: "2026-01-20T17:00:00",
    tipo: "prazo",
    responsavel: "Paloma",
    descricao: ""
  },
  {
    id: 2,
    titulo: "Encontro da equipe",
    dataInicio: "2026-02-03T11:13:00",
    dataFim: "2026-02-03T12:16:00",
    tipo: "reuniao",
    responsavel: "SMIT/CGTIC/CA",
    descricao: ""
  },
  {
    id: 3,
    titulo: "Treinamento de Segurança da Informação",
    dataInicio: "2026-02-10T09:00:00",
    dataFim: "2026-02-10T18:00:00",
    tipo: "prazo",
    responsavel: "Dennis",
    descricao: ""
  },
  {
    id: 4,
    titulo: "Reunião Mensal",
    dataInicio: "2026-02-25T08:00:00",
    dataFim: "2026-02-25T09:00:00",
    tipo: "reuniao",
    responsavel: "Paloma",
    descricao: ""
  },
  {
    id: 5,
    titulo: "Atualização de Infraestrutura",
    dataInicio: "2026-03-05T08:00:00",
    dataFim: "2026-03-05T18:00:00",
    tipo: "evento",
    responsavel: "André",
    descricao: ""
  },
  {
    id: 6,
    titulo: "Workshop de Inovação",
    dataInicio: "2026-04-12T09:00:00",
    dataFim: "2026-04-12T17:00:00",
    tipo: "reuniao",
    responsavel: "Felipe Ferrari",
    descricao: ""
  },
  {
    id: 7,
    titulo: "Auditoria de Sistemas",
    dataInicio: "2026-05-08T09:00:00",
    dataFim: "2026-05-08T18:00:00",
    tipo: "prazo",
    responsavel: "Alexander",
    descricao: ""
  },
  {
    id: 8,
    titulo: "Reunião Semestral CGTIC",
    dataInicio: "2026-06-15T09:00:00",
    dataFim: "2026-06-15T12:00:00",
    tipo: "reuniao",
    responsavel: "Noguchi",
    descricao: ""
  },
  {
    id: 9,
    titulo: "Implementação de Novos Sistemas",
    dataInicio: "2026-07-20T08:00:00",
    dataFim: "2026-07-20T18:00:00",
    tipo: "evento",
    responsavel: "Felipe Camodeca",
    descricao: ""
  },
  {
    id: 10,
    titulo: "Avaliação de Performance",
    dataInicio: "2026-08-10T09:00:00",
    dataFim: "2026-08-10T17:00:00",
    tipo: "reuniao",
    responsavel: "Paloma",
    descricao: ""
  },
  {
    id: 11,
    titulo: "Semana de Tecnologia",
    dataInicio: "2026-09-18T08:00:00",
    dataFim: "2026-09-18T14:00:00",
    tipo: "evento",
    responsavel: "Felipe Ferrari",
    descricao: ""
  },
  {
    id: 12,
    titulo: "Backup e Recuperação - Testes",
    dataInicio: "2026-10-12T08:00:00",
    dataFim: "2026-10-12T18:00:00",
    tipo: "evento",
    responsavel: "André",
    descricao: ""
  },
  {
    id: 13,
    titulo: "Planejamento Orçamentário 2027",
    dataInicio: "2026-11-20T09:00:00",
    dataFim: "2026-11-20T17:00:00",
    tipo: "reuniao",
    responsavel: "Paloma",
    descricao: ""
  },
  {
    id: 14,
    titulo: "Encerramento e Balanço Anual",
    dataInicio: "2026-12-15T09:00:00",
    dataFim: "2026-12-15T12:00:00",
    tipo: "reuniao",
    responsavel: "Noguchi",
    descricao: ""
  }
];

// Função para inicializar eventos no localStorage
export function initializeEventos() {
  const stored = localStorage.getItem('calendario_eventos');
  if (!stored || JSON.parse(stored).length === 0) {
    localStorage.setItem('calendario_eventos', JSON.stringify(eventosIniciais));
    console.log('[Eventos] Eventos iniciais carregados');
  }
}
