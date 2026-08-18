// Estado Global
let carrinho = JSON.parse(localStorage.getItem('nuvem_carrinho')) || [];
let favoritos = JSON.parse(localStorage.getItem('nuvem_favoritos')) || [];

document.addEventListener('DOMContentLoaded', () => {
  renderProdutos(produtosData);
  atualizarBadges();

  // Event Listeners para Filtros
  document.getElementById('searchInput')?.addEventListener('input', aplicarFiltros);
  document.getElementById('catFilter')?.addEventListener('change', aplicarFiltros);
  document.getElementById('generoFilter')?.addEventListener('change', aplicarFiltros);
  document.getElementById('ordemFilter')?.addEventListener('change', aplicarFiltros);
});

function renderProdutos(lista) {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 30px;">Nenhum produto encontrado com estes filtros.</p>';
    return;
  }

  lista.forEach(prod => {
    const isFav = favoritos.includes(prod.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <button class="fav-btn" onclick="toggleFavorito(${prod.id})">
        ${isFav ? '❤️' : '🤍'}
      </button>
      <img src="${prod.imagem}" alt="${prod.nome}" class="product-img">
      <div class="product-info">
        <span style="font-size: 0.75rem; color: #888;">${prod.categoria}</span>
        <h3 class="product-title">${prod.nome}</h3>
        <div class="product-price">
          <span class="price-old">R$ ${prod.preco.toFixed(2)}</span>
          <span class="price-current">R$ ${prod.precoPromocional.toFixed(2)}</span>
        </div>
        <button class="btn-add-cart" onclick="adicionarAoCarrinho(${prod.id})">🛒 Adicionar</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function aplicarFiltros() {
  const termo = document.getElementById('searchInput').value.toLowerCase();
  const categoria = document.getElementById('catFilter').value;
  const genero = document.getElementById('generoFilter').value;
  const ordem = document.getElementById('ordemFilter').value;

  let filtrados = produtosData.filter(p => {
    const bateNome = p.nome.toLowerCase().includes(termo);
    const bateCat = categoria === 'todas' || p.categoria === categoria;
    const bateGen = genero === 'todos' || p.genero === genero;
    return bateNome && bateCat && bateGen;
  });

  if (ordem === 'menorPreco') {
    filtrados.sort((a, b) => a.precoPromocional - b.precoPromocional);
  } else if (ordem === 'maiorPreco') {
    filtrados.sort((a, b) => b.precoPromocional - a.precoPromocional);
  } else if (ordem === 'melhorAvaliados') {
    filtrados.sort((a, b) => b.avaliacao - a.avaliacao);
  }

  renderProdutos(filtrados);
}

// Favoritos
function toggleFavorito(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(fId => fId !== id);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem('nuvem_favoritos', JSON.stringify(favoritos));
  atualizarBadges();
  aplicarFiltros();
}

// Carrinho
function adicionarAoCarrinho(id) {
  const item = carrinho.find(c => c.id === id);
  if (item) {
    item.quantidade++;
  } else {
    const prod = produtosData.find(p => p.id === id);
    carrinho.push({ ...prod, quantidade: 1, tamanhoSel: prod.tamanhos[0] });
  }
  salvarCarrinho();
  alert('Produto adicionado ao carrinho!');
}

function salvarCarrinho() {
  localStorage.setItem('nuvem_carrinho', JSON.stringify(carrinho));
  atualizarBadges();
  renderCarrinhoModal();
}

function atualizarBadges() {
  const cartCount = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
  const favCount = favoritos.length;

  document.getElementById('cartBadge').innerText = cartCount;
  document.getElementById('favBadge').innerText = favCount;
}

// Modal Carrinho & Checkout Simulation
function abrirModalCarrinho() {
  renderCarrinhoModal();
  document.getElementById('modalCarrinho').style.display = 'flex';
}

function fecharModalCarrinho() {
  document.getElementById('modalCarrinho').style.display = 'none';
}

function renderCarrinhoModal() {
  const body = document.getElementById('carrinhoItems');
  if (!body) return;

  if (carrinho.length === 0) {
    body.innerHTML = '<p>Seu carrinho está vazio.</p>';
    document.getElementById('cartTotal').innerText = '0.00';
    return;
  }

  let total = 0;
  body.innerHTML = carrinho.map((item, index) => {
    const subtotal = item.precoPromocional * item.quantidade;
    total += subtotal;
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <div>
          <strong>${item.nome}</strong><br>
          <small>R$ ${item.precoPromocional.toFixed(2)} x ${item.quantidade}</small>
        </div>
        <div>
          <button onclick="alterarQtd(${index}, -1)">-</button>
          <span>${item.quantidade}</span>
          <button onclick="alterarQtd(${index}, 1)">+</button>
          <button onclick="removerItem(${index})" style="color:red; background:none; border:none; margin-left:10px; cursor:pointer;">❌</button>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('cartTotal').innerText = total.toFixed(2);
}

function alterarQtd(index, delta) {
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  salvarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
}

function simularCheckout() {
  if (carrinho.length === 0) {
    alert('Adicione produtos ao carrinho antes de finalizar!');
    return;
  }
  alert('✨ Pedido #NU' + Math.floor(Math.random() * 89999 + 10000) + ' realizado com sucesso! (Modo Demonstração)');
  carrinho = [];
  salvarCarrinho();
  fecharModalCarrinho();
}

function abrirAdminModal() {
  document.getElementById('modalAdmin').style.display = 'flex';
}
function fecharAdminModal() {
  document.getElementById('modalAdmin').style.display = 'none';
}
