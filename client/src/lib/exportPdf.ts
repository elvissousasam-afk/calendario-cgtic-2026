import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Evento {
  id: number;
  titulo: string;
  descricao: string | null;
  dataEvento: Date | string;
  horaInicio: string | null;
  horaFim: string | null;
  tipoEvento: string;
  cor: string | null;
  responsavelNome: string | null;
}

const MONTH_NAMES = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

// Cores dos cabeçalhos dos meses (tons neutros)
const MONTH_COLORS: Record<number, { r: number; g: number; b: number }> = {
  1: { r: 51, g: 65, b: 85 },    // slate-700
  2: { r: 71, g: 85, b: 105 },   // slate-600
  3: { r: 63, g: 63, b: 70 },    // zinc-700
  4: { r: 82, g: 82, b: 91 },    // zinc-600
  5: { r: 64, g: 64, b: 64 },    // neutral-700
  6: { r: 82, g: 82, b: 82 },    // neutral-600
  7: { r: 68, g: 64, b: 60 },    // stone-700
  8: { r: 87, g: 83, b: 78 },    // stone-600
  9: { r: 55, g: 65, b: 81 },    // gray-700
  10: { r: 75, g: 85, b: 99 },   // gray-600
  11: { r: 30, g: 41, b: 59 },   // slate-800
  12: { r: 39, g: 39, b: 42 },   // zinc-800
};

// Cores dos eventos por tipo
const EVENT_COLORS: Record<string, { r: number; g: number; b: number }> = {
  reuniao: { r: 59, g: 130, b: 246 },    // blue-500
  prazo: { r: 239, g: 68, b: 68 },       // red-500
  evento: { r: 34, g: 197, b: 94 },      // green-500
  feriado: { r: 168, g: 85, b: 247 },    // purple-500
  aniversario: { r: 236, g: 72, b: 153 }, // pink-500
  outro: { r: 107, g: 114, b: 128 },     // gray-500
};

function getEventColor(tipoEvento: string, cor: string | null): { r: number; g: number; b: number } {
  if (cor) {
    // Converter cor hex para RGB
    const hex = cor.replace("#", "");
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
      };
    }
  }
  return EVENT_COLORS[tipoEvento] || EVENT_COLORS.outro;
}

export function exportCalendarToPdf(eventos: Evento[], ano: number) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const cardWidth = (pageWidth - margin * 4) / 3;
  const headerHeight = 12;
  const eventHeight = 18;
  const cardPadding = 3;

  // Título principal
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Calendário Gerencial CGTIC - ${ano}`, pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Controle de Eventos, Prazos e Responsáveis | Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 21, { align: "center" });

  // Agrupar eventos por mês
  const eventosPorMes: Record<number, Evento[]> = {};
  eventos.forEach((evento) => {
    const date = typeof evento.dataEvento === "string" ? new Date(evento.dataEvento) : evento.dataEvento;
    const mes = date.getMonth() + 1;
    if (!eventosPorMes[mes]) eventosPorMes[mes] = [];
    eventosPorMes[mes].push(evento);
  });

  // Ordenar eventos por data dentro de cada mês
  Object.keys(eventosPorMes).forEach((mes) => {
    eventosPorMes[parseInt(mes)].sort((a, b) => {
      const dateA = typeof a.dataEvento === "string" ? new Date(a.dataEvento) : a.dataEvento;
      const dateB = typeof b.dataEvento === "string" ? new Date(b.dataEvento) : b.dataEvento;
      return dateA.getTime() - dateB.getTime();
    });
  });

  // Calcular altura necessária para cada mês
  const getMonthHeight = (mes: number): number => {
    const eventosDoMes = eventosPorMes[mes] || [];
    return headerHeight + Math.max(eventosDoMes.length * (eventHeight + 2) + cardPadding * 2, 20);
  };

  // Desenhar os 12 meses em grid 4x3
  let currentPage = 1;
  let startY = 28;
  
  // Primeira página: meses 1-6 (2 linhas de 3)
  for (let row = 0; row < 2; row++) {
    let maxRowHeight = 0;
    
    // Calcular altura máxima da linha
    for (let col = 0; col < 3; col++) {
      const mes = row * 3 + col + 1;
      maxRowHeight = Math.max(maxRowHeight, getMonthHeight(mes));
    }
    
    // Verificar se cabe na página
    if (startY + maxRowHeight > pageHeight - margin) {
      doc.addPage();
      currentPage++;
      startY = 15;
    }
    
    // Desenhar os 3 meses da linha
    for (let col = 0; col < 3; col++) {
      const mes = row * 3 + col + 1;
      const x = margin + col * (cardWidth + margin);
      const y = startY;
      const eventosDoMes = eventosPorMes[mes] || [];
      const cardHeight = getMonthHeight(mes);
      
      // Fundo do cartão
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      
      // Cabeçalho do mês
      const monthColor = MONTH_COLORS[mes];
      doc.setFillColor(monthColor.r, monthColor.g, monthColor.b);
      doc.roundedRect(x, y, cardWidth, headerHeight, 2, 2, "F");
      // Cobrir cantos inferiores arredondados
      doc.rect(x, y + headerHeight - 2, cardWidth, 2, "F");
      
      // Nome do mês
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(MONTH_NAMES[mes - 1], x + cardWidth / 2, y + headerHeight / 2 + 1, { align: "center", baseline: "middle" });
      
      // Eventos do mês
      let eventY = y + headerHeight + cardPadding;
      
      if (eventosDoMes.length === 0) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        doc.text("Nenhum evento", x + cardWidth / 2, eventY + 6, { align: "center" });
      } else {
        eventosDoMes.forEach((evento) => {
          const date = typeof evento.dataEvento === "string" ? new Date(evento.dataEvento) : evento.dataEvento;
          const eventColor = getEventColor(evento.tipoEvento, evento.cor);
          
          // Fundo do evento
          doc.setFillColor(eventColor.r, eventColor.g, eventColor.b);
          doc.roundedRect(x + 2, eventY, cardWidth - 4, eventHeight, 1.5, 1.5, "F");
          
          // Data e horário
          doc.setFontSize(6);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          
          const dataStr = format(date, "dd/MM/yyyy");
          const horaStr = evento.horaInicio && evento.horaFim 
            ? `${evento.horaInicio} - ${evento.horaFim}`
            : evento.horaInicio || "";
          
          // Badge da data
          doc.setFillColor(0, 0, 0, 0.2);
          doc.roundedRect(x + 4, eventY + 1.5, 18, 4.5, 1, 1, "F");
          doc.text(dataStr, x + 5, eventY + 4.5);
          
          // Badge do horário (se existir)
          if (horaStr) {
            doc.roundedRect(x + 24, eventY + 1.5, 18, 4.5, 1, 1, "F");
            doc.text(horaStr, x + 25, eventY + 4.5);
          }
          
          // Título do evento
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          const tituloMaxWidth = cardWidth - 8;
          const tituloTruncado = evento.titulo.length > 35 
            ? evento.titulo.substring(0, 35) + "..." 
            : evento.titulo;
          doc.text(tituloTruncado, x + 4, eventY + 10.5);
          
          // Responsável
          if (evento.responsavelNome) {
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            const respTruncado = evento.responsavelNome.length > 40 
              ? evento.responsavelNome.substring(0, 40) + "..." 
              : evento.responsavelNome;
            doc.text(respTruncado, x + 4, eventY + 15);
          }
          
          eventY += eventHeight + 2;
        });
      }
    }
    
    startY += maxRowHeight + margin;
  }
  
  // Segunda página: meses 7-12 (2 linhas de 3)
  doc.addPage();
  startY = 15;
  
  for (let row = 0; row < 2; row++) {
    let maxRowHeight = 0;
    
    // Calcular altura máxima da linha
    for (let col = 0; col < 3; col++) {
      const mes = 6 + row * 3 + col + 1;
      maxRowHeight = Math.max(maxRowHeight, getMonthHeight(mes));
    }
    
    // Verificar se cabe na página
    if (startY + maxRowHeight > pageHeight - margin) {
      doc.addPage();
      startY = 15;
    }
    
    // Desenhar os 3 meses da linha
    for (let col = 0; col < 3; col++) {
      const mes = 6 + row * 3 + col + 1;
      const x = margin + col * (cardWidth + margin);
      const y = startY;
      const eventosDoMes = eventosPorMes[mes] || [];
      const cardHeight = getMonthHeight(mes);
      
      // Fundo do cartão
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "FD");
      
      // Cabeçalho do mês
      const monthColor = MONTH_COLORS[mes];
      doc.setFillColor(monthColor.r, monthColor.g, monthColor.b);
      doc.roundedRect(x, y, cardWidth, headerHeight, 2, 2, "F");
      doc.rect(x, y + headerHeight - 2, cardWidth, 2, "F");
      
      // Nome do mês
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(MONTH_NAMES[mes - 1], x + cardWidth / 2, y + headerHeight / 2 + 1, { align: "center", baseline: "middle" });
      
      // Eventos do mês
      let eventY = y + headerHeight + cardPadding;
      
      if (eventosDoMes.length === 0) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(156, 163, 175);
        doc.text("Nenhum evento", x + cardWidth / 2, eventY + 6, { align: "center" });
      } else {
        eventosDoMes.forEach((evento) => {
          const date = typeof evento.dataEvento === "string" ? new Date(evento.dataEvento) : evento.dataEvento;
          const eventColor = getEventColor(evento.tipoEvento, evento.cor);
          
          // Fundo do evento
          doc.setFillColor(eventColor.r, eventColor.g, eventColor.b);
          doc.roundedRect(x + 2, eventY, cardWidth - 4, eventHeight, 1.5, 1.5, "F");
          
          // Data e horário
          doc.setFontSize(6);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          
          const dataStr = format(date, "dd/MM/yyyy");
          const horaStr = evento.horaInicio && evento.horaFim 
            ? `${evento.horaInicio} - ${evento.horaFim}`
            : evento.horaInicio || "";
          
          // Badge da data
          doc.setFillColor(0, 0, 0, 0.2);
          doc.roundedRect(x + 4, eventY + 1.5, 18, 4.5, 1, 1, "F");
          doc.text(dataStr, x + 5, eventY + 4.5);
          
          // Badge do horário (se existir)
          if (horaStr) {
            doc.roundedRect(x + 24, eventY + 1.5, 18, 4.5, 1, 1, "F");
            doc.text(horaStr, x + 25, eventY + 4.5);
          }
          
          // Título do evento
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          const tituloTruncado = evento.titulo.length > 35 
            ? evento.titulo.substring(0, 35) + "..." 
            : evento.titulo;
          doc.text(tituloTruncado, x + 4, eventY + 10.5);
          
          // Responsável
          if (evento.responsavelNome) {
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            const respTruncado = evento.responsavelNome.length > 40 
              ? evento.responsavelNome.substring(0, 40) + "..." 
              : evento.responsavelNome;
            doc.text(respTruncado, x + 4, eventY + 15);
          }
          
          eventY += eventHeight + 2;
        });
      }
    }
    
    startY += maxRowHeight + margin;
  }

  // Rodapé com total de eventos
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Total: ${eventos.length} eventos`, pageWidth - margin, pageHeight - 5, { align: "right" });

  // Salvar o PDF
  doc.save(`calendario-cgtic-${ano}.pdf`);
}

export function exportEventosToPdf(eventos: Evento[], titulo: string = "Lista de Eventos") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(titulo, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 28, { align: "center" });

  // Ordenar por data
  const eventosOrdenados = [...eventos].sort((a, b) => {
    const dateA = typeof a.dataEvento === "string" ? new Date(a.dataEvento) : a.dataEvento;
    const dateB = typeof b.dataEvento === "string" ? new Date(b.dataEvento) : b.dataEvento;
    return dateA.getTime() - dateB.getTime();
  });

  let y = 40;
  const cardHeight = 20;

  eventosOrdenados.forEach((evento) => {
    if (y + cardHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    const date = typeof evento.dataEvento === "string" ? new Date(evento.dataEvento) : evento.dataEvento;
    const eventColor = getEventColor(evento.tipoEvento, evento.cor);

    // Fundo do evento
    doc.setFillColor(eventColor.r, eventColor.g, eventColor.b);
    doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 2, 2, "F");

    // Data e horário
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    
    const dataStr = format(date, "dd/MM/yyyy");
    const horaStr = evento.horaInicio && evento.horaFim 
      ? `${evento.horaInicio} - ${evento.horaFim}`
      : evento.horaInicio || "";

    doc.text(`${dataStr}  ${horaStr}`, margin + 3, y + 5);

    // Título
    doc.setFontSize(10);
    doc.text(evento.titulo, margin + 3, y + 12);

    // Responsável
    if (evento.responsavelNome) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(evento.responsavelNome, margin + 3, y + 17);
    }

    y += cardHeight + 3;
  });

  doc.save(`eventos-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
