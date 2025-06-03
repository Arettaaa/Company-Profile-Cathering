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

      if (header) {
        header.addEventListener('click', function () {
          item.classList.toggle('faq-active');
          if (toggleIcon) {
            toggleIcon.classList.toggle('bi-chevron-down');
            toggleIcon.classList.toggle('bi-chevron-up');
          }
        });
      }
    });
  });

  document.querySelectorAll('.client-img').forEach(img => {
    img.addEventListener('click', () => {
      document.querySelectorAll('.client-img').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
    });
  });


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

  let allProduk = [];
  let allGambar = [];
  let filteredProduk = [];
  let filteredGambar = [];
  let currentPage = 1;
  const itemsPerPage = 12;
  let isSearchMode = false; // Flag untuk mendeteksi mode pencarian

  document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchProdukData();
    allProduk = data.produkList;
    allGambar = data.gambarList;
    filteredProduk = allProduk;
    filteredGambar = allGambar;
    renderProduk(filteredProduk, filteredGambar, currentPage, itemsPerPage);
    setupSearch();
    setupFilterButtons();
  });

// FETCH DATA PRODUK INDIVIDUAL
async function fetchProdukData() {
  try {
    const [gambarRes, produkRes] = await Promise.all([
      fetch('data/gambar.json'),
      fetch('data/product.xml')
    ]);

    const gambarData = await gambarRes.json();
    const produkText = await produkRes.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(produkText, "application/xml");
    
    const items = xmlDoc.querySelectorAll('produk > item');
    const produkList = Array.from(items).map(item => ({
      nama: item.querySelector('nama').textContent,
      harga: item.querySelector('harga').textContent,
      kategori: item.querySelector('kategori').textContent,
    }));

    return { produkList, gambarList: gambarData.gambar };
  } catch (error) {
    console.error('Error fetching produk data:', error);
    return { produkList: [], gambarList: [] };
  }
}

function renderProduk(produkList, gambarList, page = 1, itemsPerPage = 12) {
  const container = document.getElementById('produk-container');
  if (!container) return;
  
  container.innerHTML = '';

  if (produkList.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3 style="color: #304750; font-weight: 600; margin-bottom: 1rem; margin-top: 1rem; font-size: 24px;">Produk Tidak Tersedia</h3>
        <p>Maaf, produk yang Anda cari saat ini tidak ditemukan.</p>
      </div>
    `;
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
      paginationContainer.style.display = 'none';
    }
    return;
  }

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProduk = produkList.slice(startIndex, endIndex);
  const paginatedGambar = gambarList.slice(startIndex, endIndex);

  paginatedProduk.forEach((produk, i) => {
    const gambar = paginatedGambar[i] || 'assets/img/default.png';
    const col = document.createElement('div');
    col.className = `col-lg-4 col-md-6 productt-item filter-${produk.kategori.toLowerCase()}`;
    col.setAttribute('data-kategori', produk.kategori);

    col.innerHTML = `
      <div class="productt-content h-100">
        <img src="${gambar}" class="img-fluid" alt="${produk.nama}">
        <div class="productt-info">
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

 
async function fetchPaketHarga() {
  try {
    const response = await fetch('data/harga-paket.xml');
    const xmlText = await response.text();
    console.log('Raw XML:', xmlText); // Debug: lihat XML mentah
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

    // Check for XML parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return [];
    }

    const paketNodes = xmlDoc.querySelectorAll('produkpaket');
    console.log('Jumlah paket ditemukan:', paketNodes.length);

    const paketList = Array.from(paketNodes).map((paket, index) => {
      const kategoriElement = paket.querySelector('kategori');
      const kategori = kategoriElement ? kategoriElement.textContent.trim() : `Kategori ${index + 1}`;
      
      console.log(`Processing paket ${index + 1}: "${kategori}"`);
      
      const itemNodes = paket.querySelectorAll('item');
      console.log(`Found ${itemNodes.length} items for kategori "${kategori}"`);
      
      const items = Array.from(itemNodes).map((item, itemIndex) => {
        const namaElement = item.querySelector('nama');
        const hargaElement = item.querySelector('harga');
        const satuanElement = item.querySelector('satuan');
        
        const itemData = {
          nama: namaElement ? namaElement.textContent.trim() : `Item ${itemIndex + 1}`,
          harga: hargaElement ? hargaElement.textContent.trim() : '0',
          satuan: satuanElement ? satuanElement.textContent.trim() : 'pax'
        };
        
        console.log(`Item ${itemIndex + 1}:`, itemData);
        return itemData;
      });
      
      const paketData = { kategori, items };
      console.log(`Paket "${kategori}" completed with ${items.length} items`);
      return paketData;
    });

    console.log('Final paket list:', paketList);
    return paketList;
  } catch (error) {
    console.error('Error fetching paket harga:', error);
    return [];
  }
}

function renderPaketHarga(paketList) {
  console.log('renderPaketHarga called with:', paketList);
  
  const pricingContainer = document.querySelector('#pricing-row');
  if (!pricingContainer) {
    console.error('Pricing container (#pricing-row) not found!');
    return;
  }

  pricingContainer.innerHTML = '';

  if (!Array.isArray(paketList) || paketList.length === 0) {
    console.error('Invalid or empty paket list');
    pricingContainer.innerHTML = '<div class="col-12"><p class="text-center">Tidak ada data paket tersedia</p></div>';
    return;
  }

  paketList.forEach((paket, index) => {
    console.log(`Rendering paket ${index + 1}:`, paket);
    
    if (!paket.kategori || !Array.isArray(paket.items)) {
      console.error(`Invalid paket structure at index ${index}:`, paket);
      return;
    }
    
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';

    let paketItemsHTML = '';
    if (paket.items.length > 0) {
      paket.items.forEach(item => {
        if (item.nama && item.harga) {
          paketItemsHTML += `
            <h4 style="color: #304750;">${item.nama}:</h4>
            <div class="price">Rp ${item.harga}<span> / ${item.satuan}</span></div>
          `;
        }
      });
    } else {
      console.warn(`No items found for kategori: ${paket.kategori}`);
      paketItemsHTML = '<p class="text-muted">Tidak ada item tersedia</p>';
    }

    let deskripsi = [];
    const kategoriLower = paket.kategori.toLowerCase();
    
    if (kategoriLower.includes('keluarga')) {
      deskripsi = ['Pernikahan', 'Ulang Tahun', 'Arisan'];
    } else if (kategoriLower.includes('perusahaan') && kategoriLower.includes('instansi')) {
      deskripsi = ['Rapat', 'Pelatihan', 'Event Korporat'];
    } else if (kategoriLower.includes('konsumsi')) {
      deskripsi = ['Langganan Harian', 'Langganan Mingguan', 'Langganan Bulanan'];
    } else {
      deskripsi = ['Berbagai Event', 'Acara Khusus', 'Layanan Katering'];
    }

    const deskripsiHTML = deskripsi.map(item => `<li>${item}</li>`).join('');

    col.innerHTML = `
      <div class="pricing-tem">
        <h3 style="color: #d17ecc;">${paket.kategori}</h3>
        <ul>
          ${deskripsiHTML}
        </ul>
        ${paketItemsHTML}
        <a href="https://wa.me/6285813207889" class="btn-buy">Pesan</a>
      </div>
    `;

    pricingContainer.appendChild(col);
    console.log(`Paket "${paket.kategori}" berhasil ditambahkan ke DOM`);
  });
  
  console.log('Total children in pricing container:', pricingContainer.children.length);
}

function renderPagination(totalItems, currentPage, itemsPerPage) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;
  
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
      if (isSearchMode) {
        performSearch(i);
      } else {
        const filterBtn = document.querySelector('#filter-buttons .filter-active');
        const filter = filterBtn ? filterBtn.getAttribute('data-filter') : 'all';
        applyFilter(filter, i);
      }
    });
    ul.appendChild(li);
  }

  paginationContainer.appendChild(ul);
}

function applyFilter(kategori, page = 1) {
  if (!window._produkList || !window._gambarList) return;
  
  isSearchMode = false; // Reset search mode
  
  let produkFiltered = [...window._produkList];
  let gambarFiltered = [...window._gambarList];

  if (kategori !== 'all') {
    produkFiltered = produkFiltered.filter(p => p.kategori === kategori);
    const indexes = window._produkList
      .map((p, i) => (p.kategori === kategori ? i : -1))
      .filter(i => i !== -1);
    gambarFiltered = indexes.map(i => window._gambarList[i]);
  }

  currentPage = page;
  renderProduk(produkFiltered, gambarFiltered, page, 12);
}

function setupFilterButtons() {
  const buttons = document.querySelectorAll('#filter-buttons li');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('filter-active'));
      button.classList.add('filter-active');
      const kategori = button.getAttribute('data-filter');
      
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = '';
      }
      
      isSearchMode = false;
      
      applyFilter(kategori, 1);
    });
  });
}

async function loadProduk() {
  console.log('loadProduk started');
  
  try {
    const [produkData, paketList] = await Promise.all([
      fetchProdukData(),
      fetchPaketHarga()
    ]);
    
    const { produkList, gambarList } = produkData;
    
    window._produkList = produkList;
    window._gambarList = gambarList;
    window._paketList = paketList;
    
    console.log('Data loaded:', {
      produk: produkList.length,
      gambar: gambarList.length,
      paket: paketList.length
    });

    setupFilterButtons();
    setupSearchInput();
    applyFilter('all', 1);

    if (paketList && paketList.length > 0) {
      renderPaketHarga(paketList);
    } else {
      console.error('No paket data found!');
    }

  } catch (error) {
    console.error('Gagal memuat produk:', error);
  }
}

function performSearch(page = 1) {
  const keyword = document.getElementById('search-input').value.toLowerCase().trim();
  
  if (!window._produkList || !window._gambarList) return;

  isSearchMode = true;
  currentPage = page;

  if (keyword === '') {
    isSearchMode = false;
    // Kembalikan ke filter kategori yang sedang aktif
    const activeFilterBtn = document.querySelector('#filter-buttons .filter-active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    applyFilter(activeFilter, 1);
    
    // Pastikan paket harga tetap ditampilkan lengkap
    if (window._paketList && window._paketList.length > 0) {
      renderPaketHarga(window._paketList);
    }
    return;
  }

  // Dapatkan kategori yang sedang aktif
  const activeFilterBtn = document.querySelector('#filter-buttons .filter-active');
  const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

  // Filter berdasarkan kategori terlebih dahulu (jika bukan 'all')
  let produkToSearch = window._produkList;
  let gambarToSearch = window._gambarList;
  
  if (activeFilter !== 'all') {
    const filteredIndexes = window._produkList
      .map((p, i) => (p.kategori === activeFilter ? i : -1))
      .filter(i => i !== -1);
    
    produkToSearch = filteredIndexes.map(i => window._produkList[i]);
    gambarToSearch = filteredIndexes.map(i => window._gambarList[i]);
  }

  // Kemudian filter berdasarkan keyword dalam kategori yang sudah difilter
  const hasil = produkToSearch
    .map((p, i) => ({ produk: p, gambar: gambarToSearch[i] }))
    .filter(({ produk }) => produk.nama.toLowerCase().includes(keyword));

  renderProduk(
    hasil.map(h => h.produk),
    hasil.map(h => h.gambar),
    page, 12
  );

  if (window._paketList && window._paketList.length > 0) {
    renderPaketHarga(window._paketList);
  }
}



function setupSearchInput() {
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  
  if (searchButton) {
    searchButton.addEventListener('click', function() {
      performSearch(1); 
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch(1); 
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  loadProduk();
});

document.addEventListener('DOMContentLoaded', function() {
  const whatsappForm = document.getElementById("whatsappForm");
  if (whatsappForm) {
    whatsappForm.addEventListener("submit", function(event) {
      event.preventDefault(); 

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

      if (name === "") {
        alert("Nama wajib diisi.");
        return;
      }

      if (email === "" || !emailPattern.test(email)) {
        alert("Masukkan email yang valid.");
        return;
      }

      if (message === "") {
        alert("Pesan wajib diisi.");
        return;
      }

      const text = `Halo, saya ${name}.%0AEmail: ${email}%0APesan: ${message}`;
      const phoneNumber = "6285813207889"; 

      const whatsappURL = `https://wa.me/${phoneNumber}?text=${text}`;
      window.open(whatsappURL, '_blank');
    });
  }
});