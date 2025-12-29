import { notifyOwner } from "./_core/notification";
import { getEventos, getAniversariosDoMes } from "./db";
import { format, addDays, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIPO_LABELS: Record<string, string> = {
  reuniao: "Reunião",
  prazo: "Prazo",
  evento: "Evento",
  feriado: "Feriado",
  aniversario: "Aniversário",
  outro: "Outro",
};

interface EventoNotificacao {
  id: number;
  titulo: string;
  dataEvento: Date | string;
  horaInicio: string | null;
  tipoEvento: string;
  responsavelNome: string | null;
}

/**
 * Busca eventos que ocorrerão nos próximos X dias e envia notificação
 */
export async function notifyUpcomingEvents(diasAntecedencia: number = 1): Promise<boolean> {
  try {
    const hoje = new Date();
    const dataLimite = addDays(hoje, diasAntecedencia);
    
    // Buscar todos os eventos
    const eventos = await getEventos();
    
    // Filtrar eventos que estão dentro do período
    const eventosProximos = eventos.filter((evento) => {
      const dataEvento = typeof evento.dataEvento === "string" 
        ? new Date(evento.dataEvento) 
        : evento.dataEvento;
      
      return isWithinInterval(dataEvento, { start: hoje, end: dataLimite });
    });

    if (eventosProximos.length === 0) {
      console.log("[Notificação] Nenhum evento próximo encontrado");
      return true;
    }

    // Agrupar por data
    const eventosPorData: Record<string, typeof eventosProximos> = {};
    eventosProximos.forEach((evento) => {
      const dataEvento = typeof evento.dataEvento === "string" 
        ? new Date(evento.dataEvento) 
        : evento.dataEvento;
      const dataKey = format(dataEvento, "yyyy-MM-dd");
      
      if (!eventosPorData[dataKey]) {
        eventosPorData[dataKey] = [];
      }
      eventosPorData[dataKey].push(evento);
    });

    // Montar conteúdo da notificação
    let content = `📅 **Eventos dos próximos ${diasAntecedencia} dia(s):**\n\n`;
    
    Object.entries(eventosPorData)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([dataKey, eventosData]) => {
        const data = new Date(dataKey);
        const isHoje = isSameDay(data, hoje);
        const dataFormatada = format(data, "EEEE, dd 'de' MMMM", { locale: ptBR });
        
        content += `**${isHoje ? "🔴 HOJE - " : ""}${dataFormatada}**\n`;
        
        eventosData.forEach((evento) => {
          const hora = evento.horaInicio || "Dia todo";
          const tipo = TIPO_LABELS[evento.tipoEvento] || evento.tipoEvento;
          const responsavel = evento.responsavelNome ? ` (${evento.responsavelNome})` : "";
          
          content += `  • ${hora} - ${evento.titulo} [${tipo}]${responsavel}\n`;
        });
        
        content += "\n";
      });

    content += `\n_Total: ${eventosProximos.length} evento(s)_`;

    // Enviar notificação
    const titulo = `📆 Calendário CGTIC - ${eventosProximos.length} evento(s) próximo(s)`;
    
    const success = await notifyOwner({ title: titulo, content });
    
    if (success) {
      console.log(`[Notificação] Enviada com sucesso: ${eventosProximos.length} eventos`);
    } else {
      console.warn("[Notificação] Falha ao enviar notificação");
    }
    
    return success;
  } catch (error) {
    console.error("[Notificação] Erro ao processar eventos:", error);
    return false;
  }
}

/**
 * Busca aniversários do mês atual e envia notificação
 */
export async function notifyBirthdays(): Promise<boolean> {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    
    const aniversarios = await getAniversariosDoMes(mesAtual);
    
    if (aniversarios.length === 0) {
      console.log("[Notificação] Nenhum aniversário no mês");
      return true;
    }

    // Filtrar aniversários dos próximos 7 dias
    const aniversariosProximos = aniversarios.filter((aniv) => {
      const dataNasc = typeof aniv.dataNascimento === "string" 
        ? new Date(aniv.dataNascimento) 
        : aniv.dataNascimento;
      
      // Criar data do aniversário este ano
      const aniversarioEsteAno = new Date(hoje.getFullYear(), dataNasc.getMonth(), dataNasc.getDate());
      
      return isWithinInterval(aniversarioEsteAno, { 
        start: hoje, 
        end: addDays(hoje, 7) 
      });
    });

    if (aniversariosProximos.length === 0) {
      return true;
    }

    let content = `🎂 **Aniversários da semana:**\n\n`;
    
    aniversariosProximos.forEach((aniv) => {
      const dataNasc = typeof aniv.dataNascimento === "string" 
        ? new Date(aniv.dataNascimento) 
        : aniv.dataNascimento;
      
      const dataFormatada = format(dataNasc, "dd/MM");
      const cargo = aniv.cargo ? ` - ${aniv.cargo}` : "";
      const setor = aniv.setor ? ` (${aniv.setor})` : "";
      
      content += `  🎈 **${aniv.nome}** - ${dataFormatada}${cargo}${setor}\n`;
    });

    const titulo = `🎂 ${aniversariosProximos.length} aniversário(s) esta semana`;
    
    return await notifyOwner({ title: titulo, content });
  } catch (error) {
    console.error("[Notificação] Erro ao processar aniversários:", error);
    return false;
  }
}

/**
 * Envia resumo diário de eventos
 */
export async function sendDailySummary(): Promise<boolean> {
  try {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    
    const eventos = await getEventos(ano, mes);
    
    // Eventos de hoje
    const eventosHoje = eventos.filter((evento) => {
      const dataEvento = typeof evento.dataEvento === "string" 
        ? new Date(evento.dataEvento) 
        : evento.dataEvento;
      return isSameDay(dataEvento, hoje);
    });

    // Eventos de amanhã
    const amanha = addDays(hoje, 1);
    const eventosAmanha = eventos.filter((evento) => {
      const dataEvento = typeof evento.dataEvento === "string" 
        ? new Date(evento.dataEvento) 
        : evento.dataEvento;
      return isSameDay(dataEvento, amanha);
    });

    let content = `📋 **Resumo Diário - ${format(hoje, "dd/MM/yyyy")}**\n\n`;
    
    // Eventos de hoje
    content += `**📌 Hoje (${eventosHoje.length} evento(s)):**\n`;
    if (eventosHoje.length > 0) {
      eventosHoje.forEach((evento) => {
        const hora = evento.horaInicio || "Dia todo";
        content += `  • ${hora} - ${evento.titulo}\n`;
      });
    } else {
      content += "  _Nenhum evento agendado_\n";
    }
    
    content += "\n";
    
    // Eventos de amanhã
    content += `**📅 Amanhã (${eventosAmanha.length} evento(s)):**\n`;
    if (eventosAmanha.length > 0) {
      eventosAmanha.forEach((evento) => {
        const hora = evento.horaInicio || "Dia todo";
        content += `  • ${hora} - ${evento.titulo}\n`;
      });
    } else {
      content += "  _Nenhum evento agendado_\n";
    }

    const titulo = `📋 Resumo Diário CGTIC - ${format(hoje, "dd/MM")}`;
    
    return await notifyOwner({ title: titulo, content });
  } catch (error) {
    console.error("[Notificação] Erro ao enviar resumo diário:", error);
    return false;
  }
}
