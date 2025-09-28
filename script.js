// ========================
// Sistema de Autenticação
// ========================

// Verificar se usuário está logado
function verificarAutenticacao() {
    const userLogado = JSON.parse(localStorage.getItem("userLogado"));
    if (!userLogado && !window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Mostrar mensagem no site
function mostrarMensagem(mensagem, tipo = 'success') {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.getElementById('mensagem-global');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }

    // Criar elemento da mensagem
    const mensagemEl = document.createElement('div');
    mensagemEl.id = 'mensagem-global';
    mensagemEl.textContent = mensagem;
    mensagemEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;

    // Cor baseada no tipo
    if (tipo === 'success') {
        mensagemEl.style.background = 'var(--success)';
    } else if (tipo === 'error') {
        mensagemEl.style.background = 'var(--accent)';
    } else {
        mensagemEl.style.background = 'var(--primary)';
    }

    document.body.appendChild(mensagemEl);

    // Remover após 3 segundos
    setTimeout(() => {
        if (mensagemEl.parentNode) {
            mensagemEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => mensagemEl.remove(), 300);
        }
    }, 3000);
}

// Login
function login(event) {
    if (event) event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioValido = usuarios.find(u => u.username === usuario && u.password === senha);
    
    if (usuarioValido) {
        localStorage.setItem("userLogado", JSON.stringify(usuarioValido));
        mostrarMensagem(`Bem-vindo, ${usuario}!`);
        setTimeout(() => window.location.href = "index.html", 1000);
    } else {
        mostrarMensagem("Usuário ou senha incorretos!", 'error');
    }
}

// Cadastro
function cadastrar(event) {
    if (event) event.preventDefault();
    
    const novoUsuario = document.getElementById('novoUsuario').value;
    const novoEmail = document.getElementById('novoEmail').value;
    const novaSenha = document.getElementById('novaSenha').value;
    
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    
    // Verificar se usuário já existe
    if (usuarios.find(u => u.username === novoUsuario)) {
        mostrarMensagem("Usuário já existe!", 'error');
        return;
    }
    
    if (usuarios.find(u => u.email === novoEmail)) {
        mostrarMensagem("Email já cadastrado!", 'error');
        return;
    }
    
    const novoUser = {
        username: novoUsuario,
        email: novoEmail,
        password: novaSenha
    };
    
    usuarios.push(novoUser);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("userLogado", JSON.stringify(novoUser));
    
    mostrarMensagem(`Cadastro realizado com sucesso! Bem-vindo, ${novoUsuario}!`);
    setTimeout(() => window.location.href = "index.html", 1500);
}

// Logout
function logout() {
    const user = JSON.parse(localStorage.getItem("userLogado"));
    localStorage.removeItem("userLogado");
    if (user) {
        mostrarMensagem(`Até logo, ${user.username}!`);
    }
    setTimeout(() => window.location.href = "login.html", 1000);
}

// Toggle senha
function toggleSenha(id) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// ========================
// Sistema de Carrinho
// ========================

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

// Adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
    if (!verificarAutenticacao()) return;
    
    carrinho.push(produto);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarCarrinho();
    mostrarMensagem(`${produto.nome} adicionado ao carrinho! 🛒`);
}

// Atualizar ícone do carrinho
function atualizarCarrinho() {
    const count = document.getElementById("cart-count");
    if (count) count.textContent = carrinho.length;
}

// Exibir carrinho na página carrinho.html
function carregarCarrinho() {
    if (!verificarAutenticacao()) return;
    
    const lista = document.getElementById("lista-carrinho");
    const totalEl = document.getElementById("total-carrinho");
    if (!lista) return;

    lista.innerHTML = "";
    let total = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = "<li class='carrinho-vazio'>Seu carrinho está vazio</li>";
    } else {
        carrinho.forEach((item, i) => {
            const li = document.createElement("li");
            li.classList.add("carrinho-item", "fade-in");
            li.innerHTML = `
                <span>${item.nome} - R$ ${item.preco.toFixed(2)}</span>
                <button class="btn-remove" onclick="removerItem(${i})">❌</button>
            `;
            lista.appendChild(li);
            total += item.preco;
        });
    }

    totalEl.textContent = total.toFixed(2);
}

// Remover item específico
function removerItem(index) {
    const produtoRemovido = carrinho[index].nome;
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
    atualizarCarrinho();
    mostrarMensagem(`${produtoRemovido} removido do carrinho`);
}

// Esvaziar carrinho
function esvaziarCarrinho() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho já está vazio", 'error');
        return;
    }

    // Criar modal de confirmação personalizado
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 2rem; border-radius: 12px; text-align: center; max-width: 400px;">
            <h3>Esvaziar Carrinho</h3>
            <p>Tem certeza que deseja remover todos os itens do carrinho?</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="flex: 1; padding: 0.8rem; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="confirmarEsvaziarCarrinho()" 
                        style="flex: 1; padding: 0.8rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Esvaziar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function confirmarEsvaziarCarrinho() {
    carrinho = [];
    localStorage.removeItem("carrinho");
    carregarCarrinho();
    atualizarCarrinho();
    
    // Remover modal
    const modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) modal.remove();
    
    mostrarMensagem("Carrinho esvaziado com sucesso");
}

// Finalizar compra -> vai para checkout
function finalizarCompra() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho está vazio!", 'error');
        return;
    }
    window.location.href = "checkout.html";
}

// ========================
// Checkout - Resumo
// ========================

function carregarResumo() {
    if (!verificarAutenticacao()) return;
    
    const resumo = document.getElementById("resumo-pedido");
    const totalEl = document.getElementById("total-final");
    if (!resumo) return;

    resumo.innerHTML = "";
    let total = 0;

    carrinho.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("fade-in");
        li.textContent = `${item.nome} - R$ ${item.preco.toFixed(2)}`;
        resumo.appendChild(li);
        total += item.preco;
    });

    totalEl.textContent = total.toFixed(2);

    const form = document.getElementById("form-pagamento");
    if (form) {
        form.addEventListener("submit", e => {
            e.preventDefault();

            // Salvar histórico
            const historico = JSON.parse(localStorage.getItem("historico")) || [];
            const user = JSON.parse(localStorage.getItem("userLogado"));
            
            historico.push({
                usuario: user.username,
                data: new Date().toLocaleDateString("pt-BR"),
                itens: carrinho.map(p => p.nome),
                total: total
            });
            localStorage.setItem("historico", JSON.stringify(historico));

            // Limpar carrinho
            localStorage.removeItem("carrinho");
            carrinho = [];

            mostrarMensagem("🎉 Pedido confirmado com sucesso!");
            setTimeout(() => window.location.href = "perfil.html", 1500);
        });
    }
}

// ========================
// Perfil do usuário
// ========================

function carregarPerfil() {
    if (!verificarAutenticacao()) return;
    
    const user = JSON.parse(localStorage.getItem("userLogado"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("perfil-usuario").textContent = user.username;
    document.getElementById("perfil-email").textContent = user.email;

    // Histórico de compras
    const historico = JSON.parse(localStorage.getItem("historico")) || [];
    const lista = document.getElementById("historico-compras");

    if (lista) {
        lista.innerHTML = "";
        if (historico.length === 0) {
            lista.innerHTML = "<li>Nenhuma compra realizada ainda.</li>";
        } else {
            // Filtrar histórico do usuário atual
            const historicoUsuario = historico.filter(compra => compra.usuario === user.username);
            
            if (historicoUsuario.length === 0) {
                lista.innerHTML = "<li>Nenhuma compra realizada ainda.</li>";
            } else {
                historicoUsuario.forEach((compra, i) => {
                    const li = document.createElement("li");
                    li.classList.add("fade-in");
                    li.innerHTML = `
                        <strong>Pedido ${i + 1}</strong> - ${compra.data}<br>
                        Itens: ${compra.itens.join(", ")}<br>
                        Total: R$ ${compra.total.toFixed(2)}
                    `;
                    lista.appendChild(li);
                });
            }
        }
    }

    // Atualizar dados
    const formPerfil = document.getElementById("form-perfil");
    if (formPerfil) {
        formPerfil.addEventListener("submit", function(e) {
            e.preventDefault();
            const novoEmail = document.getElementById("novoEmail").value;
            const novaSenha = document.getElementById("novaSenha").value;

            if (novoEmail || novaSenha) {
                // Atualizar usuário
                const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
                const usuarioIndex = usuarios.findIndex(u => u.username === user.username);
                
                if (usuarioIndex !== -1) {
                    if (novoEmail) usuarios[usuarioIndex].email = novoEmail;
                    if (novaSenha) usuarios[usuarioIndex].password = novaSenha;
                    
                    localStorage.setItem("usuarios", JSON.stringify(usuarios));
                    localStorage.setItem("userLogado", JSON.stringify(usuarios[usuarioIndex]));
                    
                    mostrarMensagem("Dados atualizados com sucesso!");
                    setTimeout(() => carregarPerfil(), 1000);
                }
            } else {
                mostrarMensagem("Preencha pelo menos um campo para atualizar", 'error');
            }
        });
    }
}

// ========================
// Inicialização
// ========================

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
    // Verificar autenticação em páginas protegidas
    if (!window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
        verificarAutenticacao();
    }
    
    // Atualizar carrinho
    atualizarCarrinho();
    
    // Carregar funções específicas da página
    if (window.location.href.includes('carrinho.html')) {
        carregarCarrinho();
    } else if (window.location.href.includes('checkout.html')) {
        carregarResumo();
    } else if (window.location.href.includes('perfil.html')) {
        carregarPerfil();
    }
    
    // Adicionar animação de entrada
    setTimeout(() => {
        document.body.classList.add('fade-in');
    }, 100);
});

// ========================
// API Integration
// ========================

const API_BASE_URL = 'http://localhost:3000/api';

// Headers para requisições autenticadas
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Login com API
async function login(event) {
    if (event) event.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usuario, password: senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userLogado', JSON.stringify(data.user));
            mostrarMensagem(`Bem-vindo, ${usuario}!`);
            setTimeout(() => window.location.href = "index.html", 1000);
        } else {
            mostrarMensagem(data.error || "Erro no login", 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}

// Cadastro com API
async function cadastrar(event) {
    if (event) event.preventDefault();
    
    const novoUsuario = document.getElementById('novoUsuario').value;
    const novoEmail = document.getElementById('novoEmail').value;
    const novaSenha = document.getElementById('novaSenha').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: novoUsuario,
                email: novoEmail,
                password: novaSenha
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userLogado', JSON.stringify(data.user));
            mostrarMensagem(`Cadastro realizado com sucesso! Bem-vindo, ${novoUsuario}!`);
            setTimeout(() => window.location.href = "index.html", 1500);
        } else {
            mostrarMensagem(data.error || "Erro no cadastro", 'error');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}

// Finalizar compra com API
async function finalizarCompra() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho está vazio!", 'error');
        return;
    }

    try {
        const items = carrinho.map(item => ({
            product_id: item.id || 1, // ID do produto - ajustar conforme seus produtos
            quantity: 1,
            price: item.preco
        }));

        const totalAmount = carrinho.reduce((sum, item) => sum + item.preco, 0);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ items, totalAmount })
        });

        const data = await response.json();

        if (response.ok) {
            // Limpar carrinho local
            localStorage.removeItem("carrinho");
            carrinho = [];
            
            mostrarMensagem("🎉 Pedido confirmado com sucesso!");
            setTimeout(() => window.location.href = "perfil.html", 1500);
        } else {
            mostrarMensagem(data.error || "Erro ao finalizar pedido", 'error');
        }
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}