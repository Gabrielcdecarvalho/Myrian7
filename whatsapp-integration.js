// WhatsApp Integration Module - Preserving existing design
class WhatsAppIntegration {
    constructor() {
        this.whatsappNumber = '+5532991981342'; // Número da Myrian
        this.init();
    }

    init() {
        console.log('📱 Inicializando integração com WhatsApp...');
        
        // Adicionar funcionalidades sem alterar design existente
        this.addWhatsAppFeatures();
        
        console.log('✅ Integração com WhatsApp inicializada');
    }

    // Adicionar funcionalidades do WhatsApp de forma integrada
    addWhatsAppFeatures() {
        // Aguardar DOM estar carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.enhanceExistingButtons();
            });
        } else {
            this.enhanceExistingButtons();
        }
    }

    // Melhorar botões existentes sem alterar design
    enhanceExistingButtons() {
        // Encontrar botões de WhatsApp existentes e melhorar funcionalidade
        const whatsappButtons = document.querySelectorAll('[onclick*="shareOnWhatsApp"], .btn-whatsapp');
        
        whatsappButtons.forEach(button => {
            // Preservar classes e estilos existentes
            const originalOnClick = button.onclick;
            
            // Melhorar funcionalidade mantendo design
            button.onclick = (e) => {
                e.preventDefault();
                this.shareDocumentOnWhatsApp();
            };
        });

        // Adicionar funcionalidade de compartilhamento de áudio (se não existir)
        this.addAudioSharingIfNeeded();
    }

    // Compartilhar documento no WhatsApp
    shareDocumentOnWhatsApp() {
        try {
            // Obter texto do documento atual
            const documentText = this.getCurrentDocumentText();
            
            if (!documentText) {
                this.showError('Nenhum documento disponível para compartilhar');
                return;
            }

            // Preparar mensagem para WhatsApp
            const message = this.formatWhatsAppMessage(documentText);
            
            // Criar URL do WhatsApp
            const whatsappUrl = this.createWhatsAppUrl(message);
            
            // Abrir WhatsApp
            this.openWhatsApp(whatsappUrl);
            
            this.showSuccess('Abrindo WhatsApp para compartilhar documento...');
            
        } catch (error) {
            console.error('❌ Erro ao compartilhar no WhatsApp:', error);
            this.showError('Erro ao abrir WhatsApp');
        }
    }

    // Obter texto do documento atual
    getCurrentDocumentText() {
        // Tentar diferentes seletores para encontrar o texto
        const selectors = [
            '#result-text',
            '.result-text',
            '[id$="-result"]',
            'textarea[readonly]',
            '.document-content'
        ];

        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.value) {
                return element.value.trim();
            }
            if (element && element.textContent) {
                return element.textContent.trim();
            }
        }

        return null;
    }

    // Formatar mensagem para WhatsApp
    formatWhatsAppMessage(documentText) {
        // Obter tipo de documento
        const documentType = this.getDocumentType();
        
        // Criar cabeçalho da mensagem
        let message = `📋 *${documentType}*\n`;
        message += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
        message += `👩‍🏫 Elaborado por: Myrian Fortuna\n\n`;
        
        // Adicionar conteúdo do documento (limitado para WhatsApp)
        const maxLength = 1000; // Limite para não ficar muito longo
        if (documentText.length > maxLength) {
            message += documentText.substring(0, maxLength) + '...\n\n';
            message += `📄 *Documento completo será enviado por email*`;
        } else {
            message += documentText;
        }
        
        message += `\n\n✨ _Criado com Portal da Myrian_`;
        
        return message;
    }

    // Obter tipo de documento atual
    getDocumentType() {
        // Verificar qual seção está ativa
        if (document.querySelector('#pad-form')?.style.display !== 'none') {
            return 'PAD - Plano de Atendimento Diferenciado';
        }
        if (document.querySelector('#relatorio-form')?.style.display !== 'none') {
            return 'Relatório Individual de Desenvolvimento';
        }
        if (document.querySelector('#ata-form')?.style.display !== 'none') {
            return 'Ata de Reunião';
        }
        
        return 'Documento Pedagógico';
    }

    // Criar URL do WhatsApp
    createWhatsAppUrl(message) {
        const encodedMessage = encodeURIComponent(message);
        const encodedNumber = encodeURIComponent(this.whatsappNumber);
        
        // URL para WhatsApp Web (funciona em desktop e mobile)
        return `https://wa.me/${encodedNumber}?text=${encodedMessage}`;
    }

    // Abrir WhatsApp
    openWhatsApp(url) {
        // Tentar abrir em nova aba/janela
        const newWindow = window.open(url, '_blank');
        
        // Fallback se popup foi bloqueado
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Mostrar instruções alternativas
            this.showWhatsAppInstructions(url);
        }
    }

    // Mostrar instruções se não conseguir abrir automaticamente
    showWhatsAppInstructions(url) {
        const instructions = `
Para compartilhar no WhatsApp:

1. Copie este link: ${url}
2. Abra o WhatsApp no seu celular
3. Cole o link em qualquer conversa
4. Toque no link para abrir

Ou:
1. Abra o WhatsApp Web no navegador
2. Escaneie o QR Code com seu celular
3. O documento será enviado automaticamente
        `.trim();

        // Copiar link para área de transferência
        this.copyToClipboard(url);
        
        // Mostrar instruções
        this.showNotification('Link copiado! Veja as instruções no console ou cole diretamente no WhatsApp.', 'info');
        console.log('📱 Instruções para WhatsApp:', instructions);
    }

    // Adicionar compartilhamento de áudio se necessário
    addAudioSharingIfNeeded() {
        // Verificar se existe sistema de áudio
        if (typeof audioRecorder !== 'undefined' && audioRecorder.hasActiveRecording) {
            // Adicionar botão de compartilhar áudio no WhatsApp (se não existir)
            this.addAudioWhatsAppButton();
        }
    }

    // Adicionar botão para compartilhar áudio no WhatsApp
    addAudioWhatsAppButton() {
        const audioSections = document.querySelectorAll('.audio-download-section');
        
        audioSections.forEach(section => {
            // Verificar se já existe botão do WhatsApp
            if (section.querySelector('.whatsapp-audio-btn')) return;
            
            // Criar botão mantendo estilo existente
            const whatsappBtn = document.createElement('button');
            whatsappBtn.className = 'btn btn-whatsapp whatsapp-audio-btn';
            whatsappBtn.innerHTML = `
                <span class="btn-icon">📱</span>
                <span class="btn-text">Enviar Áudio no WhatsApp</span>
            `;
            whatsappBtn.onclick = () => this.shareAudioInstructions();
            
            // Adicionar ao container de botões
            const buttonContainer = section.querySelector('.download-buttons');
            if (buttonContainer) {
                buttonContainer.appendChild(whatsappBtn);
            }
        });
    }

    // Instruções para compartilhar áudio
    shareAudioInstructions() {
        const instructions = `
📱 *Como enviar o áudio no WhatsApp:*

1. 📥 Clique em "Baixar Áudio" primeiro
2. 📱 Abra o WhatsApp no seu celular
3. 👤 Escolha o contato (+55 32 9198-1342 - seu próprio número)
4. 📎 Toque no ícone de anexo
5. 🎵 Escolha "Áudio" ou "Documento"
6. 📁 Selecione o arquivo baixado
7. ✅ Envie!

💡 *Dica:* O áudio ficará salvo no seu WhatsApp para consultar depois!
        `.trim();

        // Copiar instruções
        this.copyToClipboard(instructions);
        
        // Mostrar notificação
        this.showSuccess('Instruções copiadas! Cole no WhatsApp ou siga os passos.');
        
        // Também mostrar no console
        console.log('📱 Instruções para enviar áudio:', instructions);
        
        // Tentar abrir WhatsApp diretamente
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent('🎵 Áudio de observações pedagógicas anexado')}`;
        window.open(whatsappUrl, '_blank');
    }

    // Compartilhar template/molde no WhatsApp
    shareTemplateOnWhatsApp(templateType) {
        try {
            const templateText = this.getTemplateForWhatsApp(templateType);
            const message = `📋 *Molde para ${templateType.toUpperCase()}*\n\n${templateText}\n\n✨ _Criado com Portal da Myrian_`;
            
            const whatsappUrl = this.createWhatsAppUrl(message);
            this.openWhatsApp(whatsappUrl);
            
            this.showSuccess('Abrindo WhatsApp para compartilhar molde...');
            
        } catch (error) {
            console.error('❌ Erro ao compartilhar molde:', error);
            this.showError('Erro ao compartilhar molde');
        }
    }

    // Obter template simplificado para WhatsApp
    getTemplateForWhatsApp(type) {
        const templates = {
            pad: `*PAD - Plano de Atendimento Diferenciado*

👶 Nome: _______________
📅 Idade: ______________
📋 Necessidades: _______
🎯 Objetivos: __________
📝 Estratégias: ________
👀 Observações: ________

📧 Enviar completo por email depois!`,

            relatorio: `*Relatório Individual*

👶 Nome: _______________
📅 Período: ____________
🧠 Desenvolvimento Cognitivo: ____
🏃 Desenvolvimento Motor: ____
😊 Social/Emocional: ____
🗣️ Linguagem: ____
👥 Relacionamentos: ____

📧 Versão completa por email!`,

            ata: `*Ata de Reunião*

📅 Data: _______________
⏰ Horário: ____________
👥 Participantes: _______
📋 Pauta: _____________
💬 Discussões: _________
✅ Decisões: __________
📝 Encaminhamentos: ____

📧 Ata oficial por email!`
        };

        return templates[type] || templates.pad;
    }

    // Criar botão de acesso rápido ao guia de IA
    addQuickAccessToAIGuide() {
        // Verificar se já existe
        if (document.querySelector('.ai-guide-quick-access')) return;

        // Criar botão flutuante discreto
        const quickAccessBtn = document.createElement('div');
        quickAccessBtn.className = 'ai-guide-quick-access';
        quickAccessBtn.innerHTML = `
            <button class="btn btn-ai-guide" onclick="whatsappIntegration.openAIGuide()">
                <span class="btn-icon">🤖</span>
                <span class="btn-text">Guia IA</span>
            </button>
        `;
        
        // Adicionar ao final da página
        document.body.appendChild(quickAccessBtn);
    }

    // Abrir guia de IA
    openAIGuide() {
        // Criar modal ou nova janela com o guia
        const guideContent = `
📖 *Guia Rápido de IA*

1. 📋 Copie o texto do documento
2. 🌐 Abra chat.openai.com ou aistudio.google.com
3. 📝 Cole o prompt mágico + seu texto
4. ✨ Receba documento aprimorado!

🔗 *Links Rápidos:*
• ChatGPT: chat.openai.com
• Google AI: aistudio.google.com

💡 *Prompt Mágico:*
"Aprimore este documento pedagógico mantendo todas as informações, mas melhorando gramática, clareza e linguagem profissional:"
        `;

        // Copiar guia
        this.copyToClipboard(guideContent);
        
        // Mostrar notificação
        this.showSuccess('Guia rápido copiado! Cole no WhatsApp ou bloco de notas.');
        
        // Abrir links em novas abas
        window.open('https://chat.openai.com', '_blank');
    }

    // Utilitários mantendo compatibilidade
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    // Sistema de notificações (reutilizando existente se disponível)
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Tentar usar sistema existente primeiro
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
            return;
        }

        // Fallback: criar notificação simples
        console.log(`${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${message}`);
        
        // Mostrar toast discreto
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 3000);
    }
}

// Instância global
const whatsappIntegration = new WhatsAppIntegration();

// Funções globais para manter compatibilidade
function shareOnWhatsApp() {
    whatsappIntegration.shareDocumentOnWhatsApp();
}

function shareTemplateOnWhatsApp(type) {
    whatsappIntegration.shareTemplateOnWhatsApp(type);
}

function shareAudioOnWhatsApp() {
    whatsappIntegration.shareAudioInstructions();
}

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Integração com WhatsApp carregada (preservando design existente)');
    
    // Adicionar funcionalidades sem alterar layout
    setTimeout(() => {
        whatsappIntegration.addQuickAccessToAIGuide();
    }, 1000);
});

