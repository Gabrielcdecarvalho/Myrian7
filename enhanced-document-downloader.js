// Enhanced Document Download Module
class DocumentDownloader {
    constructor() {
        this.currentDocument = null;
        this.documentType = '';
        this.documentData = {};
        
        this.init();
    }

    init() {
        console.log('📄 Inicializando sistema de download de documentos...');
        
        // Verificar se as bibliotecas estão carregadas
        this.checkLibraries();
        
        console.log('✅ Sistema de download inicializado');
    }

    // Verificar bibliotecas necessárias
    checkLibraries() {
        const libraries = {
            jsPDF: typeof window.jspdf !== 'undefined',
            docx: typeof window.docx !== 'undefined',
            FileSaver: typeof window.saveAs !== 'undefined'
        };
        
        console.log('📚 Status das bibliotecas:', libraries);
        
        // Se alguma biblioteca não estiver disponível, mostrar aviso
        const missingLibs = Object.entries(libraries)
            .filter(([name, loaded]) => !loaded)
            .map(([name]) => name);
            
        if (missingLibs.length > 0) {
            console.warn('⚠️ Bibliotecas não carregadas:', missingLibs);
            this.showLibraryWarning(missingLibs);
        }
    }

    // Preparar documento para download
    prepareDocument(text, type, formData = {}) {
        this.currentDocument = text;
        this.documentType = type;
        this.documentData = formData;
        
        console.log(`📝 Documento preparado: ${type}`);
        
        // Mostrar opções de download
        this.showDownloadOptions();
    }

    // Mostrar opções de download
    showDownloadOptions() {
        const resultActions = document.querySelector('.result-actions-grid');
        if (!resultActions) return;
        
        // Verificar se os botões já existem
        if (document.querySelector('.download-options-added')) return;
        
        // Adicionar botões de download
        const downloadButtons = `
            <button type="button" class="btn btn-word download-options-added" onclick="documentDownloader.downloadAsWord()">
                <span class="btn-icon">📄</span>
                <span class="btn-text">Baixar Word</span>
            </button>
            <button type="button" class="btn btn-pdf download-options-added" onclick="documentDownloader.downloadAsPDF()">
                <span class="btn-icon">📕</span>
                <span class="btn-text">Baixar PDF</span>
            </button>
            <button type="button" class="btn btn-template download-options-added" onclick="documentDownloader.downloadTemplate()">
                <span class="btn-icon">📋</span>
                <span class="btn-text">Baixar Molde</span>
            </button>
        `;
        
        // Inserir botões antes do último botão
        const lastButton = resultActions.lastElementChild;
        lastButton.insertAdjacentHTML('beforebegin', downloadButtons);
    }

    // Download como Word (.docx)
    async downloadAsWord() {
        if (!this.currentDocument) {
            this.showError('Nenhum documento disponível para download');
            return;
        }
        
        try {
            this.showLoading('Gerando documento Word...');
            
            // Método 1: Usar biblioteca docx (se disponível)
            if (typeof window.docx !== 'undefined') {
                await this.generateWordWithLibrary();
            } else {
                // Método 2: Fallback - RTF que abre no Word
                this.generateWordFallback();
            }
            
            this.hideLoading();
            this.showSuccess('Documento Word baixado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao gerar Word:', error);
            this.hideLoading();
            this.showError('Erro ao gerar documento Word. Tentando método alternativo...');
            
            // Tentar método fallback
            this.generateWordFallback();
        }
    }

    // Gerar Word usando biblioteca
    async generateWordWithLibrary() {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;
        
        // Criar documento
        const doc = new Document({
            sections: [{
                properties: {},
                children: this.createWordContent()
            }]
        });
        
        // Gerar blob
        const blob = await Packer.toBlob(doc);
        
        // Download
        const fileName = this.generateFileName('docx');
        this.saveFile(blob, fileName);
    }

    // Criar conteúdo do Word
    createWordContent() {
        const content = [];
        
        // Cabeçalho
        content.push(
            new Paragraph({
                text: this.getDocumentTitle(),
                heading: HeadingLevel.HEADING_1
            })
        );
        
        // Informações básicas
        if (this.documentData.nome) {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Nome da Criança: ",
                            bold: true
                        }),
                        new TextRun({
                            text: this.documentData.nome
                        })
                    ]
                })
            );
        }
        
        if (this.documentData.idade) {
            content.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Idade: ",
                            bold: true
                        }),
                        new TextRun({
                            text: this.documentData.idade
                        })
                    ]
                })
            );
        }
        
        // Data
        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Data: ",
                        bold: true
                    }),
                    new TextRun({
                        text: new Date().toLocaleDateString('pt-BR')
                    })
                ]
            })
        );
        
        // Linha em branco
        content.push(new Paragraph({ text: "" }));
        
        // Conteúdo principal
        const paragraphs = this.currentDocument.split('\n\n');
        paragraphs.forEach(paragraph => {
            if (paragraph.trim()) {
                content.push(
                    new Paragraph({
                        text: paragraph.trim()
                    })
                );
            }
        });
        
        // Assinatura
        content.push(new Paragraph({ text: "" }));
        content.push(new Paragraph({ text: "" }));
        content.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Elaborado por: ",
                        bold: true
                    }),
                    new TextRun({
                        text: "Myrian Fortuna - Coordenadora Pedagógica"
                    })
                ]
            })
        );
        
        return content;
    }

    // Fallback para Word (RTF)
    generateWordFallback() {
        const rtfContent = this.generateRTFContent();
        const blob = new Blob([rtfContent], { type: 'application/rtf' });
        const fileName = this.generateFileName('rtf');
        
        this.saveFile(blob, fileName);
    }

    // Gerar conteúdo RTF
    generateRTFContent() {
        const title = this.getDocumentTitle();
        const date = new Date().toLocaleDateString('pt-BR');
        
        let rtf = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}`;
        rtf += `\\f0\\fs24`;
        
        // Título
        rtf += `\\b\\fs28 ${title}\\b0\\fs24\\par\\par`;
        
        // Informações básicas
        if (this.documentData.nome) {
            rtf += `\\b Nome da Criança:\\b0  ${this.documentData.nome}\\par`;
        }
        if (this.documentData.idade) {
            rtf += `\\b Idade:\\b0  ${this.documentData.idade}\\par`;
        }
        rtf += `\\b Data:\\b0  ${date}\\par\\par`;
        
        // Conteúdo principal
        const content = this.currentDocument
            .replace(/\n/g, '\\par')
            .replace(/\t/g, '\\tab');
        rtf += content;
        
        // Assinatura
        rtf += `\\par\\par\\b Elaborado por:\\b0  Myrian Fortuna - Coordenadora Pedagógica`;
        
        rtf += `}`;
        
        return rtf;
    }

    // Download como PDF
    async downloadAsPDF() {
        if (!this.currentDocument) {
            this.showError('Nenhum documento disponível para download');
            return;
        }
        
        try {
            this.showLoading('Gerando documento PDF...');
            
            // Verificar se jsPDF está disponível
            if (typeof window.jspdf === 'undefined') {
                throw new Error('Biblioteca jsPDF não carregada');
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurações
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const lineHeight = 7;
            const maxWidth = pageWidth - (margin * 2);
            
            let yPosition = margin;
            
            // Título
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            const title = this.getDocumentTitle();
            doc.text(title, margin, yPosition);
            yPosition += lineHeight * 2;
            
            // Informações básicas
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            
            if (this.documentData.nome) {
                doc.setFont(undefined, 'bold');
                doc.text('Nome da Criança: ', margin, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(this.documentData.nome, margin + 40, yPosition);
                yPosition += lineHeight;
            }
            
            if (this.documentData.idade) {
                doc.setFont(undefined, 'bold');
                doc.text('Idade: ', margin, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(this.documentData.idade, margin + 20, yPosition);
                yPosition += lineHeight;
            }
            
            doc.setFont(undefined, 'bold');
            doc.text('Data: ', margin, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(new Date().toLocaleDateString('pt-BR'), margin + 20, yPosition);
            yPosition += lineHeight * 2;
            
            // Conteúdo principal
            doc.setFont(undefined, 'normal');
            const paragraphs = this.currentDocument.split('\n\n');
            
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
                    
                    // Verificar se precisa de nova página
                    if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    
                    lines.forEach(line => {
                        doc.text(line, margin, yPosition);
                        yPosition += lineHeight;
                    });
                    
                    yPosition += lineHeight; // Espaço entre parágrafos
                }
            });
            
            // Assinatura
            if (yPosition + (lineHeight * 3) > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            
            yPosition += lineHeight;
            doc.setFont(undefined, 'bold');
            doc.text('Elaborado por: ', margin, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text('Myrian Fortuna - Coordenadora Pedagógica', margin + 35, yPosition);
            
            // Salvar
            const fileName = this.generateFileName('pdf');
            doc.save(fileName);
            
            this.hideLoading();
            this.showSuccess('Documento PDF baixado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            this.hideLoading();
            this.showError('Erro ao gerar PDF. Tentando método alternativo...');
            
            // Fallback: download como texto
            this.downloadAsText();
        }
    }

    // Download do template/molde
    downloadTemplate() {
        try {
            const template = this.generateTemplate();
            const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
            const fileName = `molde-${this.documentType}-${new Date().toISOString().slice(0, 10)}.txt`;
            
            this.saveFile(blob, fileName);
            this.showSuccess('Molde do documento baixado!');
            
        } catch (error) {
            console.error('❌ Erro ao baixar molde:', error);
            this.showError('Erro ao baixar molde do documento');
        }
    }

    // Gerar template baseado no tipo de documento
    generateTemplate() {
        const date = new Date().toLocaleDateString('pt-BR');
        
        switch (this.documentType) {
            case 'pad':
                return `PLANO DE ATENDIMENTO DIFERENCIADO (PAD)

Nome da Criança: [INSERIR NOME]
Idade: [INSERIR IDADE]
Data de Nascimento: [INSERIR DATA]
Responsável Legal: [INSERIR NOME DO RESPONSÁVEL]
Data do Documento: ${date}
Período de Observação: [INSERIR PERÍODO]
Elaborado por: Myrian Fortuna - Coordenadora Pedagógica

NECESSIDADES IDENTIFICADAS:
[DESCREVER AS NECESSIDADES ESPECÍFICAS DA CRIANÇA]

DIAGNÓSTICO OU SUSPEITA:
[INSERIR DIAGNÓSTICO SE HOUVER]

OBJETIVOS DO PLANO:
[LISTAR OS OBJETIVOS A SEREM ALCANÇADOS]

ESTRATÉGIAS PROPOSTAS:
[DESCREVER AS ESTRATÉGIAS PEDAGÓGICAS]

OBSERVAÇÕES DETALHADAS:
[INSERIR OBSERVAÇÕES SOBRE O DESENVOLVIMENTO DA CRIANÇA]

AVALIAÇÃO E ACOMPANHAMENTO:
[DESCREVER COMO SERÁ FEITO O ACOMPANHAMENTO]

RECURSOS NECESSÁRIOS:
[LISTAR RECURSOS MATERIAIS E HUMANOS]

CRONOGRAMA:
[DEFINIR PRAZOS E ETAPAS]

RESPONSÁVEIS:
[INDICAR PROFISSIONAIS ENVOLVIDOS]

Data: ${date}
Assinatura: Myrian Fortuna - Coordenadora Pedagógica`;

            case 'relatorio':
                return `RELATÓRIO INDIVIDUAL DE DESENVOLVIMENTO

Nome da Criança: [INSERIR NOME]
Idade: [INSERIR IDADE]
Turma: [INSERIR TURMA]
Professor(a): [INSERIR NOME DO PROFESSOR]
Período: [INSERIR PERÍODO]
Data: ${date}

DESENVOLVIMENTO COGNITIVO:
[DESCREVER O DESENVOLVIMENTO COGNITIVO DA CRIANÇA]

DESENVOLVIMENTO MOTOR:
[DESCREVER O DESENVOLVIMENTO MOTOR]

DESENVOLVIMENTO SOCIAL E EMOCIONAL:
[DESCREVER ASPECTOS SOCIAIS E EMOCIONAIS]

DESENVOLVIMENTO DA LINGUAGEM:
[DESCREVER O DESENVOLVIMENTO DA LINGUAGEM]

AUTONOMIA E INDEPENDÊNCIA:
[DESCREVER NÍVEL DE AUTONOMIA]

PARTICIPAÇÃO EM ATIVIDADES:
[DESCREVER PARTICIPAÇÃO E INTERESSE]

RELACIONAMENTO COM COLEGAS:
[DESCREVER INTERAÇÃO SOCIAL]

RELACIONAMENTO COM ADULTOS:
[DESCREVER RELAÇÃO COM EDUCADORES]

OBSERVAÇÕES GERAIS:
[INSERIR OBSERVAÇÕES ADICIONAIS]

SUGESTÕES PARA CASA:
[SUGESTÕES PARA OS PAIS]

PRÓXIMOS PASSOS:
[INDICAR PRÓXIMAS ETAPAS DO DESENVOLVIMENTO]

Elaborado por: Myrian Fortuna - Coordenadora Pedagógica
Data: ${date}`;

            case 'ata':
                return `ATA DE REUNIÃO

Data: ${date}
Horário: [INSERIR HORÁRIO]
Local: [INSERIR LOCAL]
Tipo de Reunião: [INSERIR TIPO]

PARTICIPANTES:
[LISTAR TODOS OS PARTICIPANTES]

PAUTA:
1. [ITEM 1]
2. [ITEM 2]
3. [ITEM 3]

DESENVOLVIMENTO:

1. ABERTURA:
[DESCREVER ABERTURA DA REUNIÃO]

2. DISCUSSÕES:
[DESCREVER PRINCIPAIS DISCUSSÕES]

3. DECISÕES TOMADAS:
[LISTAR DECISÕES E DELIBERAÇÕES]

4. ENCAMINHAMENTOS:
[LISTAR AÇÕES E RESPONSÁVEIS]

5. PRÓXIMA REUNIÃO:
[DEFINIR DATA E PAUTA DA PRÓXIMA REUNIÃO]

OBSERVAÇÕES:
[INSERIR OBSERVAÇÕES RELEVANTES]

Ata elaborada por: Myrian Fortuna - Coordenadora Pedagógica
Data: ${date}

ASSINATURAS:
[ESPAÇO PARA ASSINATURAS DOS PARTICIPANTES]`;

            default:
                return `DOCUMENTO PEDAGÓGICO

Título: [INSERIR TÍTULO]
Data: ${date}
Elaborado por: Myrian Fortuna - Coordenadora Pedagógica

CONTEÚDO:
[INSERIR CONTEÚDO DO DOCUMENTO]

OBSERVAÇÕES:
[INSERIR OBSERVAÇÕES]

Data: ${date}
Assinatura: Myrian Fortuna - Coordenadora Pedagógica`;
        }
    }

    // Download como texto (fallback)
    downloadAsText() {
        const content = this.formatTextDocument();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const fileName = this.generateFileName('txt');
        
        this.saveFile(blob, fileName);
        this.showSuccess('Documento baixado como texto!');
    }

    // Formatar documento como texto
    formatTextDocument() {
        const title = this.getDocumentTitle();
        const date = new Date().toLocaleDateString('pt-BR');
        
        let content = `${title}\n`;
        content += `${'='.repeat(title.length)}\n\n`;
        
        if (this.documentData.nome) {
            content += `Nome da Criança: ${this.documentData.nome}\n`;
        }
        if (this.documentData.idade) {
            content += `Idade: ${this.documentData.idade}\n`;
        }
        content += `Data: ${date}\n\n`;
        
        content += this.currentDocument;
        
        content += `\n\n`;
        content += `Elaborado por: Myrian Fortuna - Coordenadora Pedagógica\n`;
        content += `Data: ${date}`;
        
        return content;
    }

    // Obter título do documento
    getDocumentTitle() {
        switch (this.documentType) {
            case 'pad':
                return 'PLANO DE ATENDIMENTO DIFERENCIADO (PAD)';
            case 'relatorio':
                return 'RELATÓRIO INDIVIDUAL DE DESENVOLVIMENTO';
            case 'ata':
                return 'ATA DE REUNIÃO';
            default:
                return 'DOCUMENTO PEDAGÓGICO';
        }
    }

    // Gerar nome do arquivo
    generateFileName(extension) {
        const date = new Date().toISOString().slice(0, 10);
        const time = new Date().toTimeString().slice(0, 5).replace(':', '');
        const name = this.documentData.nome ? 
            this.documentData.nome.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 
            'documento';
        
        return `${this.documentType}-${name}-${date}-${time}.${extension}`;
    }

    // Salvar arquivo
    saveFile(blob, fileName) {
        try {
            // Método 1: Usar FileSaver.js se disponível
            if (typeof window.saveAs !== 'undefined') {
                window.saveAs(blob, fileName);
                return;
            }
            
            // Método 2: Usar download nativo do navegador
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpar URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
        } catch (error) {
            console.error('❌ Erro ao salvar arquivo:', error);
            this.showError('Erro ao salvar arquivo');
        }
    }

    // Mostrar loading
    showLoading(message) {
        let loader = document.getElementById('download-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'download-loader';
            loader.className = 'download-loader';
            document.body.appendChild(loader);
        }
        
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p class="loader-text">${message}</p>
            </div>
        `;
        loader.style.display = 'flex';
    }

    // Esconder loading
    hideLoading() {
        const loader = document.getElementById('download-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Mostrar aviso sobre bibliotecas
    showLibraryWarning(missingLibs) {
        console.warn('⚠️ Algumas funcionalidades podem estar limitadas devido a bibliotecas não carregadas:', missingLibs);
        
        // Mostrar notificação discreta
        this.showNotification(
            'Algumas funcionalidades de download podem estar limitadas. Verifique sua conexão com a internet.',
            'warning'
        );
    }

    // Sistema de notificações
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span class="notification-text">${message}</span>
            <button class="notification-close" onclick="this.parentNode.remove()">×</button>
        `;
        
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        console.log(`${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'} ${message}`);
    }
}

// Instância global
const documentDownloader = new DocumentDownloader();

// Funções globais para uso no HTML
function downloadAsWord() {
    documentDownloader.downloadAsWord();
}

function downloadAsPDF() {
    documentDownloader.downloadAsPDF();
}

function downloadTemplate() {
    documentDownloader.downloadTemplate();
}

function downloadAsText() {
    documentDownloader.downloadAsText();
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Sistema de download de documentos carregado');
});

