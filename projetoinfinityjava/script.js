let todosOsProdutos = [];
let carrinho = JSON.parse(localStorage.getItem('vogue_cart')) || [];

async function carregarProdutos() {
    const container = document.getElementById("produtosContainer");
    container.innerHTML = "<p>Atualizando vitrine...</p>";

    try {
        // Buscando múltiplas categorias para ter mais opções
        const [fem, masc, joias] = await Promise.all([
            fetch('https://fakestoreapi.com/products/category/women\'s clothing').then(r => r.json()),
            fetch('https://fakestoreapi.com/products/category/men\'s clothing').then(r => r.json()),
            fetch('https://fakestoreapi.com/products/category/jewelery').then(r => r.json())
        ]);

        todosOsProdutos = [...fem, ...masc, ...joias];
        renderizarProdutos(todosOsProdutos);
    } catch (e) {
        container.innerHTML = "<p>Erro ao carregar. Tente novamente.</p>";
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById("produtosContainer");
    container.innerHTML = lista.map(p => `
        <div class="produto">
            <img src="${p.image}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p class="price">R$ ${(p.price * 5.2).toFixed(2)}</p>
            <button class="add-to-cart" onclick="adicionarAoCarrinho(${p.id}, '${p.title}', ${p.price * 5.2}, '${p.image}')">
                ADICIONAR À SACOLA
            </button>
        </div>
    `).join('');
}

// Filtros e Busca
function filtrarBusca() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const filtrados = todosOsProdutos.filter(p => p.title.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
}

function filtrarCategoria(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtrados = cat === 'all' ? todosOsProdutos : todosOsProdutos.filter(p => p.category === cat);
    renderizarProdutos(filtrados);
}

// Lógica do Carrinho com LocalStorage
function adicionarAoCarrinho(id, nome, preco, imagem) {
    const index = carrinho.findIndex(item => item.id === id);
    if (index > -1) {
        carrinho[index].qtd++;
    } else {
        carrinho.push({ id, nome, preco, imagem, qtd: 1 });
    }
    atualizarUI();
    mostrarCarrinho();
}

function atualizarUI() {
    localStorage.setItem('vogue_cart', JSON.stringify(carrinho));
    
    // Contador
    const totalItens = carrinho.reduce((sum, item) => sum + item.qtd, 0);
    document.getElementById('cart-count').innerText = totalItens;

    // Lista Lateral
    const lista = document.getElementById('itensCarrinho');
    lista.innerHTML = carrinho.map((item, i) => `
        <div class="cart-item">
            <img src="${item.imagem}">
            <div style="flex:1">
                <p style="font-size:0.75rem; font-weight:600">${item.nome}</p>
                <p style="font-size:0.75rem">${item.qtd}x R$ ${item.preco.toFixed(2)}</p>
            </div>
            <i class="fa-solid fa-trash-can" onclick="removerItem(${i})" style="cursor:pointer; color:#ccc"></i>
        </div>
    `).join('');

    const totalValor = carrinho.reduce((sum, item) => sum + (item.preco * item.qtd), 0);
    document.getElementById('totalCarrinho').innerText = `R$ ${totalValor.toFixed(2)}`;
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarUI();
}

// Modais
function mostrarCarrinho() {
    document.getElementById('carrinhoLateral').classList.add('active');
    document.getElementById('carrinhoOverlay').classList.add('active');
}

function fecharCarrinho() {
    document.getElementById('carrinhoLateral').classList.remove('active');
    document.getElementById('carrinhoOverlay').classList.remove('active');
}

function abrirCheckout() {
    if(carrinho.length === 0) return alert("Sua sacola está vazia!");
    document.getElementById('checkoutModal').style.display = 'flex';
}

function fecharCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function processarPagamento(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-pay');
    btn.innerText = "VALIDANDO...";
    setTimeout(() => {
        alert("Obrigado! Seu pedido foi confirmado.");
        carrinho = [];
        atualizarUI();
        window.location.reload();
    }, 2000);
}

window.onload = () => { carregarProdutos(); atualizarUI(); };