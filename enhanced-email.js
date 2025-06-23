// Enhanced Email Module with Pre-filled Recipient
class EnhancedEmailSystem {
    constructor() {
        this.defaultRecipient = 'myrianfortuna@yahoo.com.br';
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('📧 Inicializando sistema de email melhorado...');
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar email:', error);
            return false;
        }
    }

    // Abrir cliente de email nativo com dados pré-preenchidos
    openNativeEmailClient(documentData, formType, documentText = '') {
        try {
            const subject = this.generateEmailSubject(documentData, formType);
            const body = this.generateEmailBody(documentData, formType, documentText);
            
            // Codificar dados para URL
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);
            
            // Criar link mailto
            const mailtoLink = `mailto:${this.defaultRecipient}?subject=${encodedSubject}&body=${encodedBody}`;
            
            // Abrir cliente de email
            window.location.href = mailtoLink;
            
            this.showSuccess('Cliente de email aberto com dados pré-preenchidos!');
            
            // Log para debug
            console.log('📧 Email aberto:', {
                recipient: this.defaultRecipient,
                subject: subject,
                bodyLength: body.length
            });
            
        } catch (error) {
            console.error('❌ Erro ao abrir email:', error);
            this.showFallbackEmailOptions(documentData, formType, documentText);
        }
    }

    // Gerar assunto do email
    generateEmailSubject(documentData, formType) {
        const subjects = {
            pad: `PAD - ${documentData.nome || 'Criança'} - ${this.getCurrentDate()}`,
            relatorio: `Relatório Individual - ${documentData.nome || 'Criança'} - ${this.getCurrentDate()}`,
            ata: `Ata de Reunião - ${this.getCurrentDate()}`
        };
        
        return subjects[formType] || `Documento da Creche - ${this.getCurrentDate()}`;
    }

    // Gerar corpo do email
    generateEmailBody(documentData, formType, documentText = '') {
        let body = `Olá,\n\n`;
        body += `Segue em anexo o ${this.getDocumentTypeName(formType)} `;
        
        if (documentData.nome) {
            body += `da criança ${documentData.nome} `;
        }
        
        body += `elaborado em ${this.getCurrentDate()}.\n\n`;
        
        // Adicionar resumo dos dados principais
        body += this.generateDataSummary(documentData, formType);
        
        // Adicionar documento completo se fornecido
        if (documentText && documentText.trim()) {
            body += `\n\n${this.getDocumentTypeName(formType).toUpperCase()}:\n`;
            body += '='.repeat(50) + '\n\n';
            body += documentText;
            body += '\n\n' + '='.repeat(50);
        }
        
        body += `\n\nAtenciosamente,\n`;
        body += `${documentData.elaboradoPor || 'Myrian Fortuna'}\n`;
        body += `Coordenadora Pedagógica\n`;
        body += `Creche Municipal\n\n`;
        
        body += `---\n`;
        body += `Este documento foi gerado automaticamente pelo Portal da Myrian.\n`;
        body += `Data de geração: ${new Date().toLocaleString('pt-BR')}`;
        
        return body;
    }

    // Gerar resumo dos dados principais
    generateDataSummary(documentData, formType) {
        let summary = 'DADOS PRINCIPAIS:\n';
        summary += '-'.repeat(20) + '\n';
        
        switch (formType) {
            case 'pad':
                summary += `• Nome: ${documentData.nome || 'Não informado'}\n`;
                summary += `• Idade: ${documentData.idade || 'Não informado'}\n`;
                summary += `• Responsável: ${documentData.responsavel || 'Não informado'}\n`;
                summary += `• Data do documento: ${documentData.data || 'Não informado'}\n`;
                summary += `• Período de observação: ${documentData.periodo || 'Não informado'}\n`;
                break;
                
            case 'relatorio':
                summary += `• Nome: ${documentData.nome || 'Não informado'}\n`;
                summary += `• Idade: ${documentData.idade || 'Não informado'}\n`;
                summary += `• Período avaliado: ${documentData.periodo || 'Não informado'}\n`;
                summary += `• Data do relatório: ${documentData.data || 'Não informado'}\n`;
                break;
                
            case 'ata':
                summary += `• Data da reunião: ${documentData.data || 'Não informado'}\n`;
                summary += `• Horário: ${documentData.horario || 'Não informado'}\n`;
                summary += `• Local: ${documentData.local || 'Creche Municipal'}\n`;
                summary += `• Participantes: ${documentData.participantes || 'Não informado'}\n`;
                break;
        }
        
        return summary;
    }

    // Enviar email via serviço web (alternativa)
    async sendViaWebService(documentData, formType, documentText = '') {
        try {
            // Implementar integração com EmailJS ou similar
            console.log('📧 Tentando envio via serviço web...');
            
            const emailData = {
                to_email: this.defaultRecipient,
                subject: this.generateEmailSubject(documentData, formType),
                message: this.generateEmailBody(documentData, formType, documentText),
                from_name: documentData.elaboradoPor || 'Portal da Myrian',
                reply_to: 'noreply@portal-myrian.com'
            };
            
            // Aqui seria a integração real com EmailJS
            // Por enquanto, mostrar opções alternativas
            this.showFallbackEmailOptions(documentData, formType, documentText);
            
        } catch (error) {
            console.error('❌ Erro no envio via web service:', error);
            this.showFallbackEmailOptions(documentData, formType, documentText);
        }
    }

    // Mostrar opções alternativas de email
    showFallbackEmailOptions(documentData, formType, documentText = '') {
        const modalContent = `
            <div class="email-fallback-modal">
                <div class="modal-content">
                    <h3>📧 Opções de Envio por Email</h3>
                    
                    <div class="email-option">
                        <h4>✅ Opção 1: WhatsApp (Recomendado)</h4>
                        <p>Copie o texto abaixo e envie via WhatsApp:</p>
                        <button onclick="emailSystem.copyForWhatsApp('${formType}')" class="btn btn-primary">
                            📱 Copiar para WhatsApp
                        </button>
                    </div>
                    
                    <div class="email-option">
                        <h4>📧 Opção 2: Email Manual</h4>
                        <p><strong>Para:</strong> ${this.defaultRecipient}</p>
                        <p><strong>Assunto:</strong> ${this.generateEmailSubject(documentData, formType)}</p>
                        <button onclick="emailSystem.copyEmailData('${formType}')" class="btn btn-secondary">
                            📋 Copiar Dados do Email
                        </button>
                    </div>
                    
                    <div class="email-option">
                        <h4>💾 Opção 3: Salvar Documento</h4>
                        <p>Baixe o documento e anexe ao email:</p>
                        <button onclick="downloadDocumentAsWord(currentDocumentData, '${formType}')" class="btn btn-success">
                            📄 Baixar Word
                        </button>
                        <button onclick="downloadDocumentAsPDF(currentDocumentData, '${formType}')" class="btn btn-success">
                            📄 Baixar PDF
                        </button>
                    </div>
                    
                    <button onclick="emailSystem.closeModal()" class="btn btn-outline">
                        ❌ Fechar
                    </button>
                </div>
            </div>
        `;
        
        this.showModal(modalContent);
    }

    // Copiar texto formatado para WhatsApp
    copyForWhatsApp(formType) {
        const documentData = this.getCurrentDocumentData();
        const whatsappText = this.generateWhatsAppMessage(documentData, formType);
        
        this.copyToClipboard(whatsappText);
        this.showSuccess('Texto copiado! Cole no WhatsApp e envie para Myrian.');
        this.closeModal();
    }

    // Gerar mensagem para WhatsApp
    generateWhatsAppMessage(documentData, formType) {
        let message = `📋 *${this.getDocumentTypeName(formType).toUpperCase()}*\n\n`;
        
        if (documentData.nome) {
            message += `👶 *Criança:* ${documentData.nome}\n`;
        }
        
        message += `📅 *Data:* ${this.getCurrentDate()}\n\n`;
        
        // Adicionar dados principais
        const summary = this.generateDataSummary(documentData, formType);
        message += summary.replace(/•/g, '▪️');
        
        message += `\n\n📝 *Observações:*\n`;
        message += documentData.observacoes || 'Não informado';
        
        message += `\n\n👩‍🏫 *Elaborado por:* ${documentData.elaboradoPor || 'Myrian Fortuna'}`;
        message += `\n🏫 *Creche Municipal*`;
        
        return message;
    }

    // Copiar dados do email
    copyEmailData(formType) {
        const documentData = this.getCurrentDocumentData();
        const emailText = `Para: ${this.defaultRecipient}\n`;
        emailText += `Assunto: ${this.generateEmailSubject(documentData, formType)}\n\n`;
        emailText += this.generateEmailBody(documentData, formType);
        
        this.copyToClipboard(emailText);
        this.showSuccess('Dados do email copiados! Cole em seu cliente de email.');
        this.closeModal();
    }

    // Copiar para área de transferência
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // Obter dados do documento atual
    getCurrentDocumentData() {
        // Tentar obter dados do formulário ativo
        const activeForm = document.querySelector('.form-section:not([style*="display: none"])');
        if (!activeForm) return {};
        
        const formData = new FormData(activeForm.querySelector('form'));
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Obter nome do tipo de documento
    getDocumentTypeName(formType) {
        const names = {
            pad: 'PAD (Plano de Atendimento Diferenciado)',
            relatorio: 'Relatório Individual',
            ata: 'Ata de Reunião'
        };
        return names[formType] || 'Documento';
    }

    // Obter data atual formatada
    getCurrentDate() {
        return new Date().toLocaleDateString('pt-BR');
    }

    // Mostrar modal
    showModal(content) {
        const modal = document.createElement('div');
        modal.className = 'email-modal-overlay';
        modal.innerHTML = content;
        
        // Adicionar estilos do modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            `;
        }
        
        document.body.appendChild(modal);
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Fechar modal
    closeModal() {
        const modal = document.querySelector('.email-modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    // Mostrar mensagens
    showSuccess(message) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'success');
        } else {
            console.log('✅', message);
            alert(message);
        }
    }

    showError(message) {
        if (typeof app !== 'undefined' && app.showNotification) {
            app.showNotification(message, 'error');
        } else {
            console.error('❌', message);
            alert(message);
        }
    }

    // Criar botão de email melhorado
    createEmailButton(documentData, formType, documentText = '') {
        const button = document.createElement('button');
        button.className = 'btn btn-primary email-btn';
        button.innerHTML = `
            <span class="btn-icon">📧</span>
            <span class="btn-text">Enviar por Email</span>
        `;
        
        button.addEventListener('click', () => {
            this.openNativeEmailClient(documentData, formType, documentText);
        });
        
        return button;
    }

    // Verificar suporte a mailto
    checkMailtoSupport() {
        try {
            const testLink = 'mailto:test@example.com';
            const a = document.createElement('a');
            a.href = testLink;
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Instância global do sistema de email
const emailSystem = new EnhancedEmailSystem();

// Funções globais para uso no HTML
function sendDocumentByEmail(documentData, formType, documentText = '') {
    emailSystem.openNativeEmailClient(documentData, formType, documentText);
}

function createEmailButton(documentData, formType, documentText = '') {
    return emailSystem.createEmailButton(documentData, formType, documentText);
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('📧 Sistema de email melhorado inicializado');
    
    // Verificar suporte
    if (!emailSystem.checkMailtoSupport()) {
        console.warn('⚠️ Suporte limitado a mailto - usando alternativas');
    }
});

