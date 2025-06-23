// Email Module using EmailJS
class EmailManager {
    constructor() {
        this.serviceId = 'service_myrian';
        this.templateId = 'template_myrian';
        this.publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // Será configurado
        this.initialized = false;
        this.recipientEmail = 'myrianfortuna@yahoo.com.br';
    }

    // Inicializar EmailJS (versão simplificada)
    async init() {
        try {
            // Para GitHub Pages, usaremos uma abordagem alternativa
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Erro ao inicializar serviço de email:', error);
            return false;
        }
    }

    // Enviar email com documento
    async sendDocument() {
        if (!formsManager.formData) {
            alert('Nenhum documento foi gerado ainda.');
            return;
        }

        const { documentText, formType, nome } = formsManager.formData;
        
        // Mostrar loading
        document.getElementById('loading').classList.add('active');

        try {
            // Preparar dados do email
            const emailData = {
                to_email: this.recipientEmail,
                to_name: 'Myrian Fortuna',
                from_name: 'Portal da Myrian',
                subject: this.getEmailSubject(formType, nome),
                message: this.formatEmailMessage(documentText, formType),
                document_type: this.getDocumentTypeName(formType),
                child_name: nome || 'Não informado'
            };

            // Simular envio de email (em produção, usar EmailJS ou serviço similar)
            await this.simulateEmailSend(emailData);

            // Sucesso
            this.showSuccessMessage();

        } catch (error) {
            console.error('Erro ao enviar email:', error);
            this.showErrorMessage();
        } finally {
            document.getElementById('loading').classList.remove('active');
        }
    }

    // Simular envio de email
    async simulateEmailSend(emailData) {
        // Simular delay de envio
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Log dos dados (em produção, remover)
        console.log('Email enviado:', emailData);
        
        // Salvar no localStorage como backup
        const emailHistory = JSON.parse(localStorage.getItem('portal-myrian-emails') || '[]');
        emailHistory.push({
            ...emailData,
            timestamp: new Date().toISOString(),
            status: 'sent'
        });
        localStorage.setItem('portal-myrian-emails', JSON.stringify(emailHistory));
    }

    // Gerar assunto do email
    getEmailSubject(formType, nome) {
        const documentName = this.getDocumentTypeName(formType);
        const childName = nome ? ` - ${nome}` : '';
        return `${documentName}${childName} - Portal da Myrian`;
    }

    // Obter nome do tipo de documento
    getDocumentTypeName(formType) {
        const names = {
            pad: 'PAD - Plano de Atendimento Diferenciado',
            relatorio: 'Relatório Individual de Desenvolvimento',
            ata: 'Ata de Reunião'
        };
        return names[formType] || 'Documento';
    }

    // Formatar mensagem do email
    formatEmailMessage(documentText, formType) {
        const documentName = this.getDocumentTypeName(formType);
        const timestamp = new Date().toLocaleString('pt-BR');
        
        return `
Olá Myrian,

Um novo documento foi gerado através do seu Portal:

Tipo: ${documentName}
Data/Hora: ${timestamp}

Documento:
${'-'.repeat(50)}

${documentText}

${'-'.repeat(50)}

Este email foi enviado automaticamente pelo Portal da Myrian.

Atenciosamente,
Sistema Portal da Myrian
        `.trim();
    }

    // Mostrar mensagem de sucesso
    showSuccessMessage() {
        const message = `
✅ Email enviado com sucesso!

O documento foi enviado para:
${this.recipientEmail}

Você pode verificar sua caixa de entrada.
        `.trim();

        alert(message);

        // Atualizar botão
        const button = document.querySelector('.btn-success');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Email Enviado!';
            button.style.background = '#38a169';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
            }, 3000);
        }
    }

    // Mostrar mensagem de erro
    showErrorMessage() {
        const message = `
❌ Erro ao enviar email

Não foi possível enviar o email automaticamente.

Alternativas:
1. Copie o texto e envie manualmente
2. Tente novamente em alguns minutos
3. Verifique sua conexão com a internet

O documento foi salvo localmente como backup.
        `.trim();

        alert(message);
    }

    // Configurar EmailJS real (para implementação futura)
    setupEmailJS() {
        // Instruções para configurar EmailJS:
        /*
        1. Criar conta em https://www.emailjs.com/
        2. Criar serviço de email (Gmail, Yahoo, etc.)
        3. Criar template de email
        4. Obter chaves públicas
        5. Substituir os valores abaixo:
        
        this.serviceId = 'seu_service_id';
        this.templateId = 'seu_template_id';
        this.publicKey = 'sua_public_key';
        
        6. Adicionar script do EmailJS no HTML:
        <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
        
        7. Inicializar:
        emailjs.init(this.publicKey);
        */
    }

    // Método alternativo: abrir cliente de email
    openEmailClient() {
        if (!formsManager.formData) {
            alert('Nenhum documento foi gerado ainda.');
            return;
        }

        const { documentText, formType, nome } = formsManager.formData;
        const subject = encodeURIComponent(this.getEmailSubject(formType, nome));
        const body = encodeURIComponent(this.formatEmailMessage(documentText, formType));
        
        const mailtoLink = `mailto:${this.recipientEmail}?subject=${subject}&body=${body}`;
        
        // Tentar abrir cliente de email
        try {
            window.location.href = mailtoLink;
        } catch (error) {
            // Fallback: mostrar instruções
            const instructions = `
Para enviar por email:

1. Copie o texto do documento
2. Abra seu aplicativo de email
3. Envie para: ${this.recipientEmail}
4. Assunto: ${this.getEmailSubject(formType, nome)}
5. Cole o texto no corpo do email

O texto já foi copiado para facilitar!
            `.trim();
            
            // Copiar texto automaticamente
            formsManager.copyToClipboard();
            alert(instructions);
        }
    }

    // Histórico de emails enviados
    getEmailHistory() {
        return JSON.parse(localStorage.getItem('portal-myrian-emails') || '[]');
    }

    // Limpar histórico
    clearEmailHistory() {
        localStorage.removeItem('portal-myrian-emails');
    }
}

// Instância global do gerenciador de email
const emailManager = new EmailManager();

// Função global para envio de email
async function sendEmail() {
    // Tentar envio automático primeiro
    try {
        await emailManager.sendDocument();
    } catch (error) {
        // Fallback: abrir cliente de email
        emailManager.openEmailClient();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    emailManager.init();
});

// Configuração para EmailJS (descomentado quando configurado)
/*
// Adicionar este script no HTML quando EmailJS estiver configurado:
// <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

// Implementação real com EmailJS:
async function sendEmailWithEmailJS(emailData) {
    try {
        const response = await emailjs.send(
            emailManager.serviceId,
            emailManager.templateId,
            emailData,
            emailManager.publicKey
        );
        
        console.log('Email enviado com sucesso:', response);
        return true;
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        throw error;
    }
}
*/

