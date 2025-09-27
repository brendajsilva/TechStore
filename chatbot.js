document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  // Respostas pré-definidas
  const respostas = {
    "oi": "Olá! 👋 Como posso ajudar você hoje?",
    "ola": "Olá! 👋 Como posso ajudar você hoje?",
    "entrega": "🚚 Nossas entregas são realizadas em até 7 dias úteis para todo o Brasil.",
    "prazo": "🚚 Nossas entregas são realizadas em até 7 dias úteis para todo o Brasil.",
    "frete": "📦 O frete é gratuito para compras acima de R$ 299,00. Abaixo disso, cobramos R$ 15,90.",
    "garantia": "🛡️ Todos os produtos possuem 1 ano de garantia contra defeitos de fabricação.",
    "pagamento": "💳 Aceitamos cartão de crédito (até 12x), débito, Pix e boleto bancário.",
    "suporte": "📞 Nosso suporte está disponível de segunda a sexta, das 9h às 18h. Email: suporte@techstore.com",
    "devolução": "🔄 Você tem 7 dias para solicitar devolução após o recebimento do produto.",
    "trocas": "🔄 Aceitamos trocas em até 30 dias para produtos com defeito.",
    "obrigado": "😊 De nada! Estamos aqui para ajudar. Precisa de mais alguma coisa?",
    "default": "❓ Não entendi sua pergunta. Pode reformular? Ou entre em contato pelo email: suporte@techstore.com"
  };

  // Função para adicionar mensagem no chat
  function addMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.classList.add("chat-message", sender);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Mensagem de boas-vindas
  addMessage("👋 Olá! Seja bem-vindo ao suporte da TechStore. Posso ajudar com: entregas, pagamentos, garantia ou trocas?");

  // Evento envio de mensagem
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;

    // Mostra mensagem do usuário
    addMessage(msg, "user");

    // Resposta do bot
    const lower = msg.toLowerCase();
    let resposta = respostas.default;

    for (let key in respostas) {
      if (lower.includes(key)) {
        resposta = respostas[key];
        break;
      }
    }

    setTimeout(() => addMessage(resposta, "bot"), 600);

    chatInput.value = "";
  });

  // Focar no input automaticamente
  chatInput.focus();
});