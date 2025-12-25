const productGrid = document.getElementById('product-grid');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('.nav');
const toggleTheme = document.getElementById('toggle-theme');
const productStatus = document.getElementById('product-status');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('加载失败');
    const data = await res.json();
    productStatus.textContent = '';
    renderProducts(data.products || []);
  } catch (error) {
    console.error('产品加载失败', error);
    renderProducts([]);
    productStatus.textContent = '无法加载产品数据，请稍后重试。';
  }
}

function renderProducts(products) {
  if (!products.length) {
    productGrid.innerHTML = '<p class="subtitle">暂无产品数据，稍后重试。</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = item.badge || '产品';

    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = item.category || '';

    const title = document.createElement('h3');
    title.textContent = item.name || '';

    const desc = document.createElement('p');
    desc.className = 'subtitle';
    desc.textContent = item.description || '';

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = item.price || '';

    const list = document.createElement('ul');
    list.className = 'checks';
    (item.features || []).forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      list.appendChild(li);
    });

    const actions = document.createElement('div');
    actions.className = 'actions';
    const consult = document.createElement('a');
    consult.className = 'ghost';
    consult.href = '#contact';
    consult.textContent = '咨询';
    const learn = document.createElement('a');
    learn.className = 'primary';
    learn.href = '#home';
    learn.textContent = '了解更多';
    actions.append(consult, learn);

    card.append(badge, tag, title, desc, price, list, actions);
    fragment.appendChild(card);
  });

  productGrid.innerHTML = '';
  productGrid.appendChild(fragment);
}

async function submitForm(event) {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());
  const emailValid = emailPattern.test(payload.email || '');
  if (!payload.name || !emailValid || !payload.message) {
    formStatus.textContent = '请填写有效的姓名、邮箱与需求描述。';
    return;
  }
  formStatus.textContent = '提交中...';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`提交失败（${res.status}）`);
    const data = await res.json();
    formStatus.textContent = data.message || '提交成功，我们会尽快联系您。';
    contactForm.reset();
  } catch (error) {
    console.error('表单提交失败', error);
    formStatus.textContent = '提交失败，请稍后再试。';
  }
}

function toggleNav() {
  nav.classList.toggle('active');
}

function switchTheme() {
  document.body.classList.toggle('light');
}

loadProducts();
contactForm.addEventListener('submit', submitForm);
menuToggle.addEventListener('click', toggleNav);
toggleTheme.addEventListener('click', switchTheme);
