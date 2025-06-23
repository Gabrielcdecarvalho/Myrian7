// Forms Management Module
class FormsManager {
    constructor() {
        this.currentForm = null;
        this.formData = {};
        this.documentTemplates = {
            pad: this.createPADTemplate,
            relatorio: this.createRelatorioTemplate,
            ata: this.createAtaTemplate
        };
    }

    // Navegação entre seções
    showHome() {
        this.hideAllSections();
        document.getElementById('home').classList.add('active');
        this.currentForm = null;
    }

    showForm(formType) {
        this.hideAllSections();
        document.getElementById(`${formType}-form`).classList.add('active');
        this.currentForm = formType;
        this.initializeFormDefaults(formType);
    }

    showResult(documentText) {
        this.hideAllSections();
        document.getElementById('result').classList.add('active');
        document.getElementById('result-text').value = documentText;
    }

    hideAllSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
    }

    // Inicializar valores padrão dos formulários
    initializeFormDefaults(formType) {
        const today = new Date().toISOString().split('T')[0];
        
        // Definir data atual
        const dataField = document.getElementById(`${formType === 'relatorio' ? 'rel' : formType}-data`);
        if (dataField) {
            dataField.value = today;
        }

        // Definir nome da Myrian como elaborador/responsável
        const elaboradorFields = [
            document.getElementById(`${formType}-elaborador`),
            document.getElementById(`${formType === 'relatorio' ? 'rel' : formType}-elaborador`),
            document.getElementById(`${formType}-coordenador`)
        ];

        elaboradorFields.forEach(field => {
            if (field && !field.value) {
                field.value = 'Myrian Fortuna - Coordenadora Pedagógica';
            }
        });

        // Focar no primeiro campo
        const firstField = document.querySelector(`#${formType}-form input[type="text"]`);
        if (firstField) {
            setTimeout(() => firstField.focus(), 100);
        }
    }

    // Validar formulário
    validateForm(formType) {
        const form = document.getElementById(`${formType}Form`);
        const requiredFields = form.querySelectorAll('[required]');
        const errors = [];

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                errors.push(`O campo "${field.previousElementSibling.textContent}" é obrigatório.`);
                field.style.borderColor = '#e53e3e';
            } else {
                field.style.borderColor = '#e2e8f0';
            }
        });

        if (errors.length > 0) {
            alert('Por favor, preencha todos os campos obrigatórios:\n\n' + errors.join('\n'));
            return false;
        }

        return true;
    }

    // Coletar dados do formulário
    collectFormData(formType) {
        const form = document.getElementById(`${formType}Form`);
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }

        return data;
    }

    // Templates de documentos
    createPADTemplate(data) {
        const template = `
PLANO DE ATENDIMENTO DIFERENCIADO (PAD)

IDENTIFICAÇÃO:
Nome da criança: ${data.nome}
Idade: ${data.idade}
Data de nascimento: ${data.dataNascimento ? this.formatDate(data.dataNascimento) : 'Não informado'}
Responsável legal: ${data.responsavel || 'Não informado'}

INFORMAÇÕES DO DOCUMENTO:
Data do documento: ${this.formatDate(data.data)}
Período de observação: ${data.periodo}
Elaborado por: ${data.elaborador}

NECESSIDADES IDENTIFICADAS:
${data.necessidades}

${data.diagnostico ? `DIAGNÓSTICO/SUSPEITA:\n${data.diagnostico}\n` : ''}

OBJETIVOS DO PLANO:
${data.objetivos}

ESTRATÉGIAS PROPOSTAS:
${data.estrategias}

OBSERVAÇÕES DETALHADAS:
${data.observacoes}

ACOMPANHAMENTO:
Este plano deverá ser revisado periodicamente, com avaliação dos progressos e ajustes necessários nas estratégias propostas. A família será mantida informada sobre o desenvolvimento da criança e orientada sobre como apoiar o processo de aprendizagem em casa.

ASSINATURA:
_________________________________
${data.elaborador}
Coordenadora Pedagógica

Data: ${this.formatDate(data.data)}
        `.trim();

        return template;
    }

    createRelatorioTemplate(data) {
        const template = `
RELATÓRIO INDIVIDUAL DE DESENVOLVIMENTO

IDENTIFICAÇÃO:
Nome da criança: ${data.nome}
Idade: ${data.idade}
Turma/Grupo: ${data.turma || 'Não informado'}
Professor(a) responsável: ${data.professor || 'Não informado'}

PERÍODO E RESPONSÁVEL:
Período de observação: ${data.periodo}
Data do relatório: ${this.formatDate(data.data)}
Elaborado por: ${data.elaborador}

DESENVOLVIMENTO SOCIOEMOCIONAL:
${data.socioemocional}

DESENVOLVIMENTO COGNITIVO:
${data.cognitivo}

DESENVOLVIMENTO MOTOR:
${data.motor}

LINGUAGEM E COMUNICAÇÃO:
${data.linguagem}

AUTONOMIA E CUIDADOS PESSOAIS:
${data.autonomia}

OBSERVAÇÕES GERAIS E RECOMENDAÇÕES:
${data.observacoes}

CONSIDERAÇÕES FINAIS:
Este relatório reflete o desenvolvimento da criança durante o período observado. É importante que a família mantenha diálogo constante com a escola para acompanhar o progresso e apoiar o desenvolvimento integral da criança.

Estamos à disposição para esclarecimentos e orientações adicionais.

Atenciosamente,

_________________________________
${data.elaborador}
Coordenadora Pedagógica

Data: ${this.formatDate(data.data)}
        `.trim();

        return template;
    }

    createAtaTemplate(data) {
        const template = `
ATA DE REUNIÃO

INFORMAÇÕES DA REUNIÃO:
Data: ${this.formatDate(data.data)}
Horário: ${data.horario}
Local: ${data.local}
Tipo de reunião: ${data.tipo}

COORDENAÇÃO:
Coordenador(a) da reunião: ${data.coordenador}

PARTICIPANTES:
${data.participantes}

PAUTA DA REUNIÃO:
${data.pauta}

PRINCIPAIS DISCUSSÕES:
${data.discussoes}

DECISÕES TOMADAS:
${data.decisoes}

${data.acoes ? `AÇÕES E RESPONSÁVEIS:\n${data.acoes}\n` : ''}

${data.prazos ? `PRAZOS ESTABELECIDOS:\n${data.prazos}\n` : ''}

${data.observacoes ? `OBSERVAÇÕES ADICIONAIS:\n${data.observacoes}\n` : ''}

ENCERRAMENTO:
Nada mais havendo a tratar, a reunião foi encerrada e eu, ${data.coordenador}, lavrei a presente ata que, após lida e aprovada, será assinada por todos os participantes.

_________________________________
${data.coordenador}
Coordenadora da Reunião

Data: ${this.formatDate(data.data)}
        `.trim();

        return template;
    }

    // Utilitários
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Processar formulário
    async processForm(formType) {
        if (!this.validateForm(formType)) {
            return;
        }

        // Mostrar loading
        document.getElementById('loading').classList.add('active');

        try {
            // Coletar dados
            const data = this.collectFormData(formType);
            
            // Simular processamento
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Gerar documento
            const documentText = this.documentTemplates[formType].call(this, data);
            
            // Armazenar dados para envio por email
            this.formData = { ...data, documentText, formType };

            // Mostrar resultado
            this.showResult(documentText);

        } catch (error) {
            console.error('Erro ao processar formulário:', error);
            alert('Erro ao gerar documento. Tente novamente.');
        } finally {
            // Ocultar loading
            document.getElementById('loading').classList.remove('active');
        }
    }

    // Copiar texto para clipboard
    async copyToClipboard() {
        const textArea = document.getElementById('result-text');
        
        try {
            await navigator.clipboard.writeText(textArea.value);
            
            // Feedback visual
            const button = event.target;
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Copiado!';
            button.style.background = '#38a169';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 2000);
            
        } catch (error) {
            // Fallback para navegadores mais antigos
            textArea.select();
            document.execCommand('copy');
            alert('Texto copiado para a área de transferência!');
        }
    }

    // Limpar formulário
    clearForm(formType) {
        const form = document.getElementById(`${formType}Form`);
        if (form) {
            form.reset();
            this.initializeFormDefaults(formType);
        }
    }
}

// Instância global do gerenciador de formulários
const formsManager = new FormsManager();

// Funções globais para uso no HTML
function showHome() {
    formsManager.showHome();
}

function showForm(formType) {
    formsManager.showForm(formType);
}

function copyToClipboard() {
    formsManager.copyToClipboard();
}

// Inicializar formulários quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos de submit dos formulários
    const forms = ['padForm', 'relatorioForm', 'ataForm'];
    
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formType = formId.replace('Form', '');
                formsManager.processForm(formType === 'relatorio' ? 'relatorio' : formType);
            });
        }
    });

    // Configurar auto-save (salvar dados localmente)
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            localStorage.setItem(`portal-myrian-${input.id}`, input.value);
        });

        // Restaurar valores salvos
        const savedValue = localStorage.getItem(`portal-myrian-${input.id}`);
        if (savedValue && !input.value) {
            input.value = savedValue;
        }
    });
});

