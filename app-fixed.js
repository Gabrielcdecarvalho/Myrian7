// Portal da Myrian - JavaScript Principal Corrigido
// Versão que resolve todos os bugs identificados pela Myrian

class PortalMyrian {
    constructor() {
        this.currentDocument = null;
        this.audioRecorder = null;
        this.audioChunks = [];
        this.init();
    }

    init() {
        console.log('🚀 Portal da Myrian - Versão Corrigida Iniciada');
        this.setupEventListeners();
        this.setupInitialState();
    }

    setupEventListeners() {
        // Event listeners para navegação
        window.showHome = () => this.showSection('home');
        window.showForm = (type) => this.showSection(`${type}-form`);
        window.createDocument = (type) => this.createDocument(type);
        
        // Event listeners para downloads
        window.downloadAsWord = () => this.downloadAsWord();
        window.downloadAsPDF = () => this.downloadAsPDF();
        window.copyToClipboard = () => this.copyToClipboard();
        window.shareOnWhatsApp = () => this.shareOnWhatsApp();
        window.sendEmail = () => this.sendEmail();
    }

    setupInitialState() {
        // Configurar data atual em todos os campos de data
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });

        // Mostrar seção inicial
        this.showSection('home');
    }

    showSection(sectionId) {
        // Esconder todas as seções
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar seção solicitada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Scroll para o topo
        window.scrollTo(0, 0);
    }

    // CORREÇÃO PRINCIPAL: Função de criação de documentos que realmente funciona
    createDocument(type) {
        console.log(`📝 Criando documento: ${type}`);
        
        try {
            // Mostrar loading
            this.showLoading(true);
            
            // Coletar dados do formulário
            const data = this.collectFormData(type);
            
            // Validar dados obrigatórios
            if (!this.validateFormData(data, type)) {
                this.showLoading(false);
                return;
            }
            
            // Gerar documento
            const documentText = this.generateDocumentText(data, type);
            
            // Mostrar resultado
            setTimeout(() => {
                this.showResult(documentText, type);
                this.showLoading(false);
            }, 1500); // Simular processamento
            
        } catch (error) {
            console.error('Erro ao criar documento:', error);
            this.showLoading(false);
            alert('Erro ao criar documento. Tente novamente.');
        }
    }

    collectFormData(type) {
        const data = {};
        
        // Coletar todos os campos do formulário específico
        const form = document.querySelector(`#${type}-form form`);
        if (!form) {
            throw new Error(`Formulário ${type} não encontrado`);
        }
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const fieldName = input.id.replace(`${type}-`, '');
            data[fieldName] = input.value.trim();
        });
        
        return data;
    }

    validateFormData(data, type) {
        const requiredFields = this.getRequiredFields(type);
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].length === 0) {
                const fieldLabel = this.getFieldLabel(field, type);
                alert(`Por favor, preencha o campo obrigatório: ${fieldLabel}`);
                
                // Focar no campo vazio
                const input = document.getElementById(`${type}-${field}`);
                if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                return false;
            }
        }
        
        return true;
    }

    getRequiredFields(type) {
        const requiredFields = {
            'pad': ['nome', 'idade', 'data', 'periodo', 'elaborado', 'necessidades', 'objetivos', 'estrategias'],
            'relatorio': ['nome', 'idade', 'periodo', 'observacoes'],
            'ata': ['data', 'horario', 'tipo', 'participantes', 'pauta', 'desenvolvimento']
        };
        
        return requiredFields[type] || [];
    }

    getFieldLabel(field, type) {
        const labels = {
            'nome': 'Nome da Criança',
            'idade': 'Idade',
            'data': 'Data',
            'periodo': 'Período',
            'elaborado': 'Elaborado por',
            'necessidades': 'Necessidades Identificadas',
            'objetivos': 'Objetivos do Plano',
            'estrategias': 'Estratégias Propostas',
            'observacoes': 'Observações',
            'horario': 'Horário',
            'tipo': 'Tipo de Reunião',
            'participantes': 'Participantes',
            'pauta': 'Pauta da Reunião',
            'desenvolvimento': 'Desenvolvimento da Reunião'
        };
        
        return labels[field] || field;
    }

    generateDocumentText(data, type) {
        switch (type) {
            case 'pad':
                return this.generatePAD(data);
            case 'relatorio':
                return this.generateRelatorio(data);
            case 'ata':
                return this.generateAta(data);
            default:
                throw new Error(`Tipo de documento desconhecido: ${type}`);
        }
    }

    generatePAD(data) {
        const template = `PLANO DE ATENDIMENTO DIFERENCIADO (PAD)

DADOS DA CRIANÇA
Nome: ${data.nome}
Idade: ${data.idade}
Data de Nascimento: ${data.nascimento || 'Não informado'}
Responsável Legal: ${data.responsavel || 'Não informado'}

INFORMAÇÕES DO DOCUMENTO
Data de Elaboração: ${this.formatDate(data.data)}
Período de Observação: ${data.periodo}
Elaborado por: ${data.elaborado}

NECESSIDADES IDENTIFICADAS
${data.necessidades}

${data.diagnostico ? `DIAGNÓSTICO/SUSPEITA
${data.diagnostico}

` : ''}OBJETIVOS DO PLANO
${data.objetivos}

ESTRATÉGIAS PROPOSTAS
${data.estrategias}

${data.observacoes ? `OBSERVAÇÕES ADICIONAIS
${data.observacoes}

` : ''}CONSIDERAÇÕES FINAIS
Este Plano de Atendimento Diferenciado foi elaborado com base nas observações realizadas durante o período especificado, visando garantir o desenvolvimento integral da criança e sua inclusão efetiva no ambiente escolar. As estratégias propostas devem ser implementadas de forma gradual e acompanhadas continuamente pela equipe pedagógica.

Data: ${this.formatDate(data.data)}
Responsável: ${data.elaborado}`;

        return template;
    }

    generateRelatorio(data) {
        const template = `RELATÓRIO INDIVIDUAL DE DESENVOLVIMENTO

DADOS DA CRIANÇA
Nome: ${data.nome}
Idade: ${data.idade}
Turma: ${data.turma || 'Não informado'}
Período do Relatório: ${data.periodo}

${data.cognitivo ? `DESENVOLVIMENTO COGNITIVO
${data.cognitivo}

` : ''}${data.motor ? `DESENVOLVIMENTO MOTOR
${data.motor}

` : ''}${data.social ? `DESENVOLVIMENTO SOCIAL E EMOCIONAL
${data.social}

` : ''}OBSERVAÇÕES GERAIS
${data.observacoes}

CONSIDERAÇÕES FINAIS
Este relatório apresenta o desenvolvimento da criança durante o período observado, destacando os progressos alcançados e as áreas que necessitam de maior atenção. As informações aqui contidas visam contribuir para o acompanhamento contínuo do desenvolvimento integral da criança.

Atenciosamente,
Myrian Fortuna
Coordenadora Pedagógica
Data: ${this.formatDate(new Date())}`;

        return template;
    }

    generateAta(data) {
        const template = `ATA DE REUNIÃO ${data.tipo.toUpperCase()}

DADOS DA REUNIÃO
Data: ${this.formatDate(data.data)}
Horário: ${data.horario}
Local: ${data.local || 'Creche Municipal'}
Tipo: ${data.tipo}

PARTICIPANTES
${data.participantes}

PAUTA
${data.pauta}

DESENVOLVIMENTO DA REUNIÃO
${data.desenvolvimento}

ENCERRAMENTO
Nada mais havendo a tratar, a reunião foi encerrada e eu, Myrian Fortuna, lavrei a presente ata que vai assinada por mim e pelos demais participantes.

Data: ${this.formatDate(data.data)}
Coordenadora: Myrian Fortuna`;

        return template;
    }

    showResult(text, type) {
        // Armazenar documento atual
        this.currentDocument = {
            text: text,
            type: type,
            date: new Date()
        };
        
        // Mostrar texto no resultado
        const resultTextarea = document.getElementById('result-text');
        if (resultTextarea) {
            resultTextarea.value = text;
        }
        
        // Mostrar seção de resultado
        this.showSection('result');
        
        console.log('✅ Documento criado com sucesso!');
    }

    // CORREÇÃO: Downloads que realmente funcionam
    downloadAsWord() {
        if (!this.currentDocument) {
            alert('Nenhum documento foi criado ainda.');
            return;
        }

        try {
            // Criar documento Word usando biblioteca docx
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: this.currentDocument.text.split('\n').map(line => 
                        new docx.Paragraph({
                            children: [new docx.TextRun(line)]
                        })
                    )
                }]
            });

            // Gerar e baixar
            docx.Packer.toBlob(doc).then(blob => {
                const fileName = `${this.currentDocument.type}_${this.formatDateForFile(this.currentDocument.date)}.docx`;
                saveAs(blob, fileName);
                console.log('✅ Download Word realizado com sucesso!');
            }).catch(error => {
                console.error('Erro no download Word:', error);
                this.fallbackDownload('word');
            });

        } catch (error) {
            console.error('Erro ao criar documento Word:', error);
            this.fallbackDownload('word');
        }
    }

    downloadAsPDF() {
        if (!this.currentDocument) {
            alert('Nenhum documento foi criado ainda.');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar fonte
            doc.setFont('helvetica');
            doc.setFontSize(12);
            
            // Adicionar texto com quebra de linha
            const lines = doc.splitTextToSize(this.currentDocument.text, 180);
            doc.text(lines, 15, 20);
            
            // Baixar PDF
            const fileName = `${this.currentDocument.type}_${this.formatDateForFile(this.currentDocument.date)}.pdf`;
            doc.save(fileName);
            
            console.log('✅ Download PDF realizado com sucesso!');

        } catch (error) {
            console.error('Erro ao criar PDF:', error);
            this.fallbackDownload('pdf');
        }
    }

    fallbackDownload(type) {
        // Fallback: download como arquivo de texto
        const text = this.currentDocument.text;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const fileName = `${this.currentDocument.type}_${this.formatDateForFile(this.currentDocument.date)}.txt`;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Download realizado como arquivo de texto (.txt). Para ${type.toUpperCase()}, use um conversor online.`);
    }

    copyToClipboard() {
        if (!this.currentDocument) {
            alert('Nenhum documento foi criado ainda.');
            return;
        }

        try {
            navigator.clipboard.writeText(this.currentDocument.text).then(() => {
                alert('✅ Texto copiado para a área de transferência!');
                console.log('✅ Texto copiado com sucesso!');
            }).catch(error => {
                // Fallback para navegadores mais antigos
                const textarea = document.getElementById('result-text');
                if (textarea) {
                    textarea.select();
                    document.execCommand('copy');
                    alert('✅ Texto copiado para a área de transferência!');
                }
            });
        } catch (error) {
            console.error('Erro ao copiar texto:', error);
            alert('Erro ao copiar texto. Tente selecionar e copiar manualmente.');
        }
    }

    shareOnWhatsApp() {
        if (!this.currentDocument) {
            alert('Nenhum documento foi criado ainda.');
            return;
        }

        const phoneNumber = '5532991981342'; // WhatsApp da Myrian
        const message = `📋 Documento criado no Portal da Myrian\n\n${this.currentDocument.text}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        console.log('✅ Compartilhamento WhatsApp iniciado!');
    }

    sendEmail() {
        if (!this.currentDocument) {
            alert('Nenhum documento foi criado ainda.');
            return;
        }

        const email = 'myrianfortuna@yahoo.com.br';
        const subject = `Documento ${this.currentDocument.type.toUpperCase()} - ${this.formatDate(this.currentDocument.date)}`;
        const body = `Olá Myrian,\n\nSegue o documento criado no Portal da Myrian:\n\n${this.currentDocument.text}\n\nAtenciosamente,\nPortal da Myrian`;
        
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoUrl;
        console.log('✅ Email preparado e enviado!');
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateForFile(date) {
        return date.toISOString().split('T')[0];
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.portalMyrian = new PortalMyrian();
    console.log('🎉 Portal da Myrian carregado com sucesso - Versão Corrigida!');
});

