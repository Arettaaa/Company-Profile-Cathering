(function () {
  "use strict";

  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  document.addEventListener('DOMContentLoaded', function () {
    // Ambil semua item FAQ
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const header = item.querySelector('h3');
      const toggleIcon = item.querySelector('.faq-toggle');
      const content = item.querySelector('.faq-content');

      header.addEventListener('click', function () {
        item.classList.toggle('faq-active');
        toggleIcon.classList.toggle('bi-chevron-down');
        toggleIcon.classList.toggle('bi-chevron-up');
      });
    });
  });

  document.querySelectorAll('.client-img').forEach(img => {
    img.addEventListener('click', () => {
      document.querySelectorAll('.client-img').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
    });
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

async function fetchData() {
  const [gambarRes, produkRes] = await Promise.all([
    fetch('data/gambar.json'),
    fetch('data/product.xml')
  ]);

  const gambarData = await gambarRes.json();
  const produkText = await produkRes.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(produkText, "application/xml");
  
  // Ambil data produk individual
  const items = xmlDoc.querySelectorAll('produk > item');
  const produkList = Array.from(items).map(item => ({
    nama: item.querySelector('nama').textContent,
    harga: item.querySelector('harga').textContent,
    kategori: item.querySelector('kategori').textContent,
  }));

  // Ambil data paket harga
  const paketNodes = xmlDoc.querySelectorAll('produkpaket');
  const paketList = Array.from(paketNodes).map(paket => {
    const kategori = paket.querySelector('kategori').textContent;
    const items = Array.from(paket.querySelectorAll('item')).map(item => ({
      nama: item.querySelector('nama').textContent,
      harga: item.querySelector('harga').textContent,
      satuan: item.querySelector('satuan') ? item.querySelector('satuan').textContent : 'pax'
    }));
    return { kategori, items };
  });

  return { produkList, gambarList: gambarData.gambar, paketList };
}

function renderProduk(produkList, gambarList, page = 1, itemsPerPage = 12) {
  const container = document.getElementById('produk-container');
  container.innerHTML = '';

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProduk = produkList.slice(startIndex, endIndex);
  const paginatedGambar = gambarList.slice(startIndex, endIndex);

  paginatedProduk.forEach((produk, i) => {
    const gambar = paginatedGambar[i] || 'assets/img/default.png';
    const col = document.createElement('div');
    col.className = `col-lg-4 col-md-6 portfolio-item filter-${produk.kategori.toLowerCase()}`;
    col.setAttribute('data-kategori', produk.kategori);

    col.innerHTML = `
      <div class="portfolio-content h-100">
        <img src="${gambar}" class="img-fluid" alt="${produk.nama}">
        <div class="portfolio-info">
          <h4>${produk.kategori}</h4>
          <h3>${produk.nama}</h3>
          <p>Harga: Rp${produk.harga}</p>
        </div>
      </div>
    `;

    container.appendChild(col);
  });

  renderPagination(produkList.length, page, itemsPerPage);
}


function fetchHargaPaketXML() {
  fetch('harga-paket.xml')
    .then(response => response.text())
    .then(xmlText => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

      const items = xmlDoc.querySelectorAll('item');
      const paketItems = [];

      items.forEach(item => {
        const nama = item.querySelector('nama')?.textContent || '';
        const harga = item.querySelector('harga')?.textContent || '';
        const satuan = item.querySelector('satuan')?.textContent || '';

        paketItems.push({ nama, harga, satuan });
      });

      const paketList = [
        {
          kategori: 'Acara Keluarga', // Ubah sesuai kategori yang kamu mau
          items: paketItems
        }
      ];

      renderPaketHarga(paketList);
    })
    .catch(err => console.error('Gagal fetch XML:', err));
}

function renderPaketHarga(paketList) {
  const pricingContainer = document.querySelector('#pricing-row');
  if (!pricingContainer) return;

  pricingContainer.innerHTML = '';

  paketList.forEach((paket, index) => {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';

    let paketItemsHTML = '';
    paket.items.forEach(item => {
      paketItemsHTML += `
        <h4 style="color: #304750;">${item.nama}:</h4>
        <div class="price">Rp ${item.harga}<span> / ${item.satuan}</span></div>
      `;
    });

    let deskripsi = [];
    if (paket.kategori === 'Acara Keluarga') {
      deskripsi = ['Pernikahan', 'Ulang Tahun', 'Arisan'];
    } else if (paket.kategori === 'Acara Perusahaan & Instansi') {
      deskripsi = ['Rapat', 'Pelatihan', 'Event Korporat'];
    } else if (paket.kategori === 'Konsumsi Perusahaan') {
      deskripsi = ['Langganan Harian', 'Langganan Mingguan', 'Langganan Bulanan'];
    }

    const deskripsiHTML = deskripsi.map(item => `<li>${item}</li>`).join('');

    col.innerHTML = `
      <div class="pricing-tem">
        <h3 style="color: #d17ecc;">${paket.kategori}</h3>
        <ul>
          ${deskripsiHTML}
        </ul>
        ${paketItemsHTML}
        <a href="#" class="btn-buy">Pesan</a>
      </div>
    `;

    pricingContainer.appendChild(col);
  });
}

// Panggil fungsi fetch saat halaman siap
document.addEventListener('DOMContentLoaded', fetchHargaPaketXML);


function renderPagination(totalItems, currentPage, itemsPerPage) {
  const paginationContainer = document.getElementById('pagination-container');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  } else {
    paginationContainer.style.display = 'block';
  }

  const ul = document.createElement('ul');
  ul.className = 'pagination justify-content-center';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = document.querySelector('#filter-buttons .filter-active').getAttribute('data-filter');
      applyFilter(filter, i);
    });
    ul.appendChild(li);
  }

  paginationContainer.appendChild(ul);
}

function applyFilter(kategori, page = 1) {
  let produkFiltered = [...window._produkList];
  let gambarFiltered = [...window._gambarList];

  if (kategori !== 'all') {
    produkFiltered = produkFiltered.filter(p => p.kategori === kategori);
    const indexes = window._produkList
      .map((p, i) => (p.kategori === kategori ? i : -1))
      .filter(i => i !== -1);
    gambarFiltered = indexes.map(i => window._gambarList[i]);
  }

  renderProduk(produkFiltered, gambarFiltered, page, 12);
}

function setupFilterButtons() {
  const buttons = document.querySelectorAll('#filter-buttons li');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('filter-active'));
      button.classList.add('filter-active');
      const kategori = button.getAttribute('data-filter');
      applyFilter(kategori, 1);
    });
  });
}

async function loadProduk() {
  try {
    const { produkList, gambarList, paketList } = await fetchData();
    window._produkList = produkList;
    window._gambarList = gambarList;
    window._paketList = paketList;
    
    setupFilterButtons();
    applyFilter('all', 1);
    
    // Render paket harga dari XML
    renderPaketHarga(paketList);
  } catch (error) {
    console.error('Gagal memuat produk:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadProduk);