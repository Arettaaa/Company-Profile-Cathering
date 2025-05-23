
(function() {
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
    navmenu.addEventListener('click', function(e) {
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
      const header = item.querySelector('h3'); // Ambil judul FAQ
      const toggleIcon = item.querySelector('.faq-toggle'); // Ambil ikon toggle
      const content = item.querySelector('.faq-content'); // Ambil konten FAQ
      
      // Ketika header FAQ diklik
      header.addEventListener('click', function() {
        // Toggle kelas untuk menampilkan atau menyembunyikan konten
        item.classList.toggle('faq-active');
        
        // Toggle rotasi ikon toggle
        toggleIcon.classList.toggle('bi-chevron-down');
        toggleIcon.classList.toggle('bi-chevron-up');
      });
    });
  });
  
  document.querySelectorAll('.client-img').forEach(img => {
    img.addEventListener('click', () => {
      // Hapus active dari semua gambar
      document.querySelectorAll('.client-img').forEach(i => i.classList.remove('active'));
      // Tambah active ke gambar yang diklik
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
  // Ambil gambar dan produk secara paralel
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
}

function renderProduk(produkList, gambarList) {
  const container = document.getElementById('produk-container');
  container.innerHTML = '';

  produkList.forEach((produk, i) => {
    const gambar = gambarList[i] || 'assets/img/default.png';

    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 portfolio-item filter-app';

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
}

async function loadProduk() {
  try {
    const { produkList, gambarList } = await fetchData();
    renderProduk(produkList, gambarList);
  } catch (error) {
    console.error('Gagal memuat produk:', error);
  }
}

// Panggil saat halaman sudah siap
document.addEventListener('DOMContentLoaded', loadProduk);
