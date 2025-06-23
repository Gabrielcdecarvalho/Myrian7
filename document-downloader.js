// Document Download Module - Word and PDF Export
class DocumentDownloader {
    constructor() {
        this.initialized = false;
        this.loadExternalLibraries();
    }

    async loadExternalLibraries() {
        try {
            // Carregar bibliotecas necessárias via CDN
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/docx/7.8.2/docx.min.js');
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            
            this.initialized = true;
            console.log('📄 Bibliotecas de download carregadas com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar bibliotecas:', error);
            this.initialized = false;
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Download documento em formato Word (.docx)
    async downloadAsWord(documentData, formType) {
        if (!this.initialized) {
            this.showFallbackDownload(documentData, formType, 'word');
            return;
        }

        try {
            console.log('📄 Gerando documento Word...');
            
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: this.createWordContent(documentData, formType)
                }]
            });

            const blob = await docx.Packer.toBlob(doc);
            const fileName = this.generateFileName(documentData, formType, 'docx');
            
            this.downloadBlob(blob, fileName);
            this.showSuccess(`Documento Word baixado: ${fileName}`);
            
        } catch (error) {
            console.error('❌ Erro ao gerar Word:', error);
            this.showFallbackDownload(documentData, formType, 'word');
        }
    }

    // Download documento em formato PDF
    async downloadAsPDF(documentData, formType) {
        if (!this.initialized) {
            this.showFallbackDownload(documentData, formType, 'pdf');
            return;
        }

        try {
            console.log('📄 Gerando documento PDF...');
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Configurar fonte para suporte a caracteres especiais
            doc.setFont('helvetica');
            doc.setFontSize(12);
            
            // Adicionar conteúdo ao PDF
            this.addPDFContent(doc, documentData, formType);
            
            const fileName = this.generateFileName(documentData, formType, 'pdf');
            doc.save(fileName);
            
            this.showSuccess(`Documento PDF baixado: ${fileName}`);
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            this.showFallbackDownload(documentData, formType, 'pdf');
        }
    }

    // Criar conteúdo para documento Word
    createWordContent(documentData, formType) {
        const content = [];
        
        // Cabeçalho
        content.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: this.getDocumentTitle(formType),
                        bold: true,
                        size: 32
                    })
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // Informações da instituição
        content.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: 'Creche Municipal',
                        bold: true,
                        size: 24
                    })
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );

        // Data
        content.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `Data: ${documentData.data || new Date().toLocaleDateString('pt-BR')}`,
                        size: 22
                    })
                ],
                spacing: { after: 300 }
            })
        );

        // Conteúdo específico por tipo
        content.push(...this.getWordContentByType(documentData, formType));

        // Assinatura
        content.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `\n\n_________________________________\n${documentData.elaboradoPor || 'Myrian Fortuna - Coordenadora Pedagógica'}`,
                        size: 22
                    })
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: { before: 600 }
            })
        );

        return content;
    }

    // Conteúdo específico por tipo de documento
    getWordContentByType(documentData, formType) {
        const content = [];

        switch (formType) {
            case 'pad':
                content.push(
                    this.createWordSection('Dados da Criança', [
                        `Nome: ${documentData.nome || ''}`,
                        `Idade: ${documentData.idade || ''}`,
                        `Data de Nascimento: ${documentData.dataNascimento || ''}`,
                        `Responsável: ${documentData.responsavel || ''}`
                    ]),
                    this.createWordSection('Necessidades Identificadas', [
                        documentData.necessidades || ''
                    ]),
                    this.createWordSection('Objetivos do Plano', [
                        documentData.objetivos || ''
                    ]),
                    this.createWordSection('Estratégias Propostas', [
                        documentData.estrategias || ''
                    ]),
                    this.createWordSection('Observações Detalhadas', [
                        documentData.observacoes || ''
                    ])
                );
                break;

            case 'relatorio':
                content.push(
                    this.createWordSection('Dados da Criança', [
                        `Nome: ${documentData.nome || ''}`,
                        `Idade: ${documentData.idade || ''}`,
                        `Período: ${documentData.periodo || ''}`
                    ]),
                    this.createWordSection('Desenvolvimento Socioemocional', [
                        documentData.socioemocional || ''
                    ]),
                    this.createWordSection('Desenvolvimento Cognitivo', [
                        documentData.cognitivo || ''
                    ]),
                    this.createWordSection('Desenvolvimento Motor', [
                        documentData.motor || ''
                    ]),
                    this.createWordSection('Linguagem e Comunicação', [
                        documentData.linguagem || ''
                    ]),
                    this.createWordSection('Observações Gerais', [
                        documentData.observacoes || ''
                    ])
                );
                break;

            case 'ata':
                content.push(
                    this.createWordSection('Informações da Reunião', [
                        `Data: ${documentData.data || ''}`,
                        `Horário: ${documentData.horario || ''}`,
                        `Local: ${documentData.local || 'Creche Municipal'}`
                    ]),
                    this.createWordSection('Participantes', [
                        documentData.participantes || ''
                    ]),
                    this.createWordSection('Pauta', [
                        documentData.pauta || ''
                    ]),
                    this.createWordSection('Discussões', [
                        documentData.discussoes || ''
                    ]),
                    this.createWordSection('Decisões Tomadas', [
                        documentData.decisoes || ''
                    ]),
                    this.createWordSection('Observações', [
                        documentData.observacoes || ''
                    ])
                );
                break;
        }

        return content;
    }

    // Criar seção no documento Word
    createWordSection(title, items) {
        const content = [];
        
        // Título da seção
        content.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: title,
                        bold: true,
                        size: 26
                    })
                ],
                spacing: { before: 300, after: 200 }
            })
        );

        // Itens da seção
        items.forEach(item => {
            if (item && item.trim()) {
                content.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: item,
                                size: 22
                            })
                        ],
                        spacing: { after: 150 }
                    })
                );
            }
        });

        return content;
    }

    // Adicionar conteúdo ao PDF
    addPDFContent(doc, documentData, formType) {
        let yPosition = 20;
        const lineHeight = 7;
        const pageHeight = 280;
        
        // Título
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const title = this.getDocumentTitle(formType);
        doc.text(title, 105, yPosition, { align: 'center' });
        yPosition += lineHeight * 2;

        // Subtítulo
        doc.setFontSize(12);
        doc.text('Creche Municipal', 105, yPosition, { align: 'center' });
        yPosition += lineHeight * 2;

        // Data
        doc.setFont('helvetica', 'normal');
        doc.text(`Data: ${documentData.data || new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
        yPosition += lineHeight * 2;

        // Conteúdo específico
        const sections = this.getPDFSectionsByType(documentData, formType);
        
        sections.forEach(section => {
            // Verificar se precisa de nova página
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }

            // Título da seção
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 20, yPosition);
            yPosition += lineHeight;

            // Conteúdo da seção
            doc.setFont('helvetica', 'normal');
            if (section.content) {
                const lines = doc.splitTextToSize(section.content, 170);
                lines.forEach(line => {
                    if (yPosition > pageHeight - 20) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 20, yPosition);
                    yPosition += lineHeight;
                });
            }
            yPosition += lineHeight;
        });

        // Assinatura
        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }
        
        yPosition += lineHeight * 2;
        doc.text('_________________________________', 105, yPosition, { align: 'center' });
        yPosition += lineHeight;
        doc.text(documentData.elaboradoPor || 'Myrian Fortuna - Coordenadora Pedagógica', 105, yPosition, { align: 'center' });
    }

    // Seções para PDF por tipo
    getPDFSectionsByType(documentData, formType) {
        switch (formType) {
            case 'pad':
                return [
                    { title: 'Dados da Criança', content: `Nome: ${documentData.nome}\nIdade: ${documentData.idade}\nResponsável: ${documentData.responsavel}` },
                    { title: 'Necessidades Identificadas', content: documentData.necessidades },
                    { title: 'Objetivos do Plano', content: documentData.objetivos },
                    { title: 'Estratégias Propostas', content: documentData.estrategias },
                    { title: 'Observações Detalhadas', content: documentData.observacoes }
                ];

            case 'relatorio':
                return [
                    { title: 'Dados da Criança', content: `Nome: ${documentData.nome}\nIdade: ${documentData.idade}\nPeríodo: ${documentData.periodo}` },
                    { title: 'Desenvolvimento Socioemocional', content: documentData.socioemocional },
                    { title: 'Desenvolvimento Cognitivo', content: documentData.cognitivo },
                    { title: 'Desenvolvimento Motor', content: documentData.motor },
                    { title: 'Linguagem e Comunicação', content: documentData.linguagem },
                    { title: 'Observações Gerais', content: documentData.observacoes }
                ];

            case 'ata':
                return [
                    { title: 'Informações da Reunião', content: `Data: ${documentData.data}\nHorário: ${documentData.horario}\nLocal: ${documentData.local}` },
                    { title: 'Participantes', content: documentData.participantes },
                    { title: 'Pauta', content: documentData.pauta },
                    { title: 'Discussões', content: documentData.discussoes },
                    { title: 'Decisões Tomadas', content: documentData.decisoes },
                    { title: 'Observações', content: documentData.observacoes }
                ];

            default:
                return [];
        }
    }

    // Gerar nome do arquivo
    generateFileName(documentData, formType, extension) {
        const types = {
            pad: 'PAD',
            relatorio: 'Relatorio',
            ata: 'Ata'
        };
        
        const typeName = types[formType] || 'Documento';
        const childName = documentData.nome ? `_${documentData.nome.replace(/\s+/g, '_')}` : '';
        const date = new Date().toISOString().split('T')[0];
        
        return `${typeName}${childName}_${date}.${extension}`;
    }

    // Obter título do documento
    getDocumentTitle(formType) {
        const titles = {
            pad: 'PLANO DE ATENDIMENTO DIFERENCIADO (PAD)',
            relatorio: 'RELATÓRIO INDIVIDUAL DE DESENVOLVIMENTO',
            ata: 'ATA DE REUNIÃO'
        };
        
        return titles[formType] || 'DOCUMENTO';
    }

    // Download de blob
    downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Fallback para download quando bibliotecas não carregam
    showFallbackDownload(documentData, formType, format) {
        const content = this.generateTextContent(documentData, formType);
        const fileName = this.generateFileName(documentData, formType, 'txt');
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        this.downloadBlob(blob, fileName);
        
        this.showWarning(`Download em ${format.toUpperCase()} não disponível. Baixado como texto (.txt)`);
    }

    // Gerar conteúdo em texto simples
    generateTextContent(documentData, formType) {
        let content = this.getDocumentTitle(formType) + '\n';
        content += '='.repeat(content.length - 1) + '\n\n';
        content += 'Creche Municipal\n';
        content += `Data: ${documentData.data || new Date().toLocaleDateString('pt-BR')}\n\n`;

        const sections = this.getPDFSectionsByType(documentData, formType);
        sections.forEach(section => {
            content += `${section.title}:\n`;
            content += '-'.repeat(section.title.length + 1) + '\n';
            content += `${section.content || 'Não informado'}\n\n`;
        });

        content += '\n\n_________________________________\n';
        content += documentData.elaboradoPor || 'Myrian Fortuna - Coordenadora Pedagógica';

        return content;
    }

    // Mostrar mensagens
    showSuccess(message) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'success');
        } else {
            console.log('✅', message);
        }
    }

    showWarning(message) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'warning');
        } else {
            console.warn('⚠️', message);
        }
    }

    showError(message) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'error');
        } else {
            console.error('❌', message);
        }
    }
}

// Instância global do downloader
const documentDownloader = new DocumentDownloader();

// Funções globais para uso no HTML
async function downloadDocumentAsWord(documentData, formType) {
    await documentDownloader.downloadAsWord(documentData, formType);
}

async function downloadDocumentAsPDF(documentData, formType) {
    await documentDownloader.downloadAsPDF(documentData, formType);
}

// Verificar se as bibliotecas estão carregadas
function checkDownloadSupport() {
    return documentDownloader.initialized;
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar carregamento das bibliotecas
    setTimeout(() => {
        if (documentDownloader.initialized) {
            console.log('📄 Sistema de download inicializado');
        } else {
            console.warn('⚠️ Sistema de download em modo fallback (apenas texto)');
        }
    }, 3000);
});

