import { drizzle } from "drizzle-orm/mysql2";
import { eventos, responsaveis } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Dados extraídos do calendário antigo
const staffData = [
  { id: 1, name: "Noguchi", role: "Coordenador" },
  { id: 2, name: "Paloma", role: "Gestão Administrativa" },
  { id: 3, name: "Felipe Ferrari", role: "Projetos e Inovação" },
  { id: 4, name: "Felipe Camodeca", role: "Desenvolvimento" },
  { id: 5, name: "Dennis", role: "Segurança da Informação" },
  { id: 6, name: "André", role: "Infraestrutura" },
  { id: 7, name: "Alexander", role: "Suporte e Serviços" }
];

const pdfEvents = [
  { title: "Planejamento Estratégico Anual", date: "2026-01-15", resp: "Noguchi", color: "#3498db" },
  { title: "Revisão de Contratos de TI", date: "2026-01-20", resp: "Paloma", color: "#3498db" },
  { title: "Treinamento de Segurança da Informação", date: "2026-02-10", resp: "Dennis", color: "#2ecc71" },
  { title: "Atualização de Infraestrutura", date: "2026-03-05", resp: "André", color: "#e67e22" },
  { title: "Workshop de Inovação", date: "2026-04-12", resp: "Felipe Ferrari", color: "#e74c3c" },
  { title: "Auditoria de Sistemas", date: "2026-05-08", resp: "Alexander", color: "#e74c3c" },
  { title: "Reunião Semestral CGTIC", date: "2026-06-15", resp: "Noguchi", color: "#3498db" },
  { title: "Implementação de Novos Sistemas", date: "2026-07-20", resp: "Felipe Camodeca", color: "#e67e22" },
  { title: "Avaliação de Performance", date: "2026-08-10", resp: "Paloma", color: "#3498db" },
  { title: "Semana de Tecnologia", date: "2026-09-15", resp: "Felipe Ferrari", color: "#e74c3c" },
  { title: "Backup e Recuperação - Testes", date: "2026-10-12", resp: "André", color: "#e67e22" },
  { title: "Planejamento Orçamentário 2027", date: "2026-11-20", resp: "Paloma", color: "#3498db" },
  { title: "Encerramento e Balanço Anual", date: "2026-12-15", resp: "Noguchi", color: "#3498db" }
];

// Mapear cores para tipos de evento
function getEventType(color) {
  switch (color) {
    case "#3498db": return "reuniao";
    case "#2ecc71": return "evento";
    case "#e67e22": return "prazo";
    case "#e74c3c": return "evento";
    default: return "outro";
  }
}

async function migrate() {
  console.log("Iniciando migração de dados...\n");

  // 1. Inserir responsáveis
  console.log("Inserindo responsáveis...");
  const responsaveisMap = {};
  
  for (const staff of staffData) {
    try {
      const result = await db.insert(responsaveis).values({
        nome: staff.name,
        cargo: staff.role,
        email: null,
        ativo: true
      });
      
      // Buscar o ID inserido
      const [inserted] = await db.select().from(responsaveis).where(
        // Usar o nome como referência
      ).limit(1);
      
      responsaveisMap[staff.name] = result.insertId || staff.id;
      console.log(`  ✓ ${staff.name} (${staff.role})`);
    } catch (error) {
      console.error(`  ✗ Erro ao inserir ${staff.name}:`, error.message);
    }
  }

  // Buscar IDs dos responsáveis inseridos
  const responsaveisDb = await db.select().from(responsaveis);
  responsaveisDb.forEach(r => {
    responsaveisMap[r.nome] = r.id;
  });

  console.log("\nInserindo eventos...");
  
  // 2. Inserir eventos
  for (const event of pdfEvents) {
    try {
      const responsavelId = responsaveisMap[event.resp] || null;
      
      await db.insert(eventos).values({
        titulo: event.title,
        descricao: null,
        dataEvento: new Date(event.date),
        horaInicio: "09:00",
        horaFim: null,
        tipoEvento: getEventType(event.color),
        cor: event.color,
        responsavelId: responsavelId,
        criadoPorId: 1
      });
      
      console.log(`  ✓ ${event.date} - ${event.title}`);
    } catch (error) {
      console.error(`  ✗ Erro ao inserir ${event.title}:`, error.message);
    }
  }

  console.log("\n✅ Migração concluída!");
  console.log(`   - ${staffData.length} responsáveis`);
  console.log(`   - ${pdfEvents.length} eventos`);
  
  process.exit(0);
}

migrate().catch(console.error);
