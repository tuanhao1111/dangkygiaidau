(function() {
  'use strict';

  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submit-btn');
  const refreshBtn = document.getElementById('refresh-btn');

  const heClass = {
    'Tố vấn': 'he-tovan',
    'Thiết y': 'he-thietY',
    'Cửu linh': 'he-culinh',
    'Long ngâm': 'he-longngam',
    'Thần tương': 'he-thantuong',
    'Toái mộng': 'he-toaimong',
    'Huyết Hà' :'he-huyetha'
  };

  // === TABS ===
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    t.classList.add('active');
    document.querySelector(`[data-panel="${t.dataset.tab}"]`).classList.add('active');
    if (t.dataset.tab === 'list') loadList();
  }));

  // === HELPERS ===
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function setStatus(msg, type) {
    statusEl.innerHTML = msg;
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  function isConfigured() {
    return CONFIG.APPS_SCRIPT_URL && !CONFIG.APPS_SCRIPT_URL.includes('REPLACE_WITH');
  }

  // === SUBMIT ===
  submitBtn.addEventListener('click', async () => {
    const name = document.getElementById('f-name').value.trim();
    const id = document.getElementById('f-id').value.trim();
    const he = document.getElementById('f-he').value;
    const discord = document.getElementById('f-discord').value.trim();

    if (!name || !id || !he || !discord) {
      setStatus('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    if (!isConfigured()) {
      setStatus('⚠ Chưa cấu hình Google Apps Script URL trong config.js', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('<span class="spinner"></span> Đang ghi danh...');

    try {
      const formData = new FormData();
      formData.append('action', 'register');
      formData.append('name', name);
      formData.append('id', id);
      formData.append('he', he);
      formData.append('discord', discord);

      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setStatus('✓ Ghi danh thành công! Chúc anh hùng may mắn', 'success');
        document.getElementById('f-name').value = '';
        document.getElementById('f-id').value = '';
        document.getElementById('f-he').value = '';
        document.getElementById('f-discord').value = '';
        // Refresh count
        loadList(true);
      } else {
        setStatus('✗ ' + (data.error || 'Có lỗi xảy ra'), 'error');
      }
    } catch (e) {
      setStatus('✗ Không kết nối được server. Kiểm tra mạng hoặc cấu hình.', 'error');
      console.error(e);
    }

    submitBtn.disabled = false;
  });

  // === LOAD LIST ===
  async function loadList(silent) {
    const wrap = document.getElementById('table-wrap');
    const countEl = document.getElementById('reg-count');
    const tabCount = document.getElementById('tab-count');

    if (!isConfigured()) {
      wrap.innerHTML = '<div class="empty">⚠ Chưa cấu hình Google Apps Script URL trong config.js</div>';
      return;
    }

    if (!silent) {
      wrap.innerHTML = '<div class="empty"><span class="spinner"></span> Đang tải bảng phong thần...</div>';
    }

    try {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL + '?action=list');
      const data = await res.json();

      if (!data.success) {
        wrap.innerHTML = '<div class="empty">✗ Lỗi: ' + escapeHtml(data.error || 'Không tải được dữ liệu') + '</div>';
        return;
      }

      const items = data.items || [];
      countEl.textContent = items.length;
      tabCount.textContent = `(${items.length})`;

      if (!items.length) {
        wrap.innerHTML = '<div class="empty">Chưa có anh hùng nào ghi danh.<br>Hãy là người đầu tiên!</div>';
        return;
      }

      let html = '<table><thead><tr><th class="col-num">#</th><th>Tên người chơi</th><th>ID</th><th>Hệ phái</th><th>Discord</th></tr></thead><tbody>';
      items.forEach((it, i) => {
        const cls = heClass[it.he] || 'he-thietY';
        html += `<tr>
          <td class="col-num">${i + 1}</td>
          <td>${escapeHtml(it.name)}</td>
          <td>${escapeHtml(it.id)}</td>
          <td><span class="he-pill ${cls}">${escapeHtml(it.he)}</span></td>
          <td>${escapeHtml(it.discord)}</td>
        </tr>`;
      });
      html += '</tbody></table>';
      wrap.innerHTML = html;
    } catch (e) {
      wrap.innerHTML = '<div class="empty">✗ Không kết nối được server</div>';
      console.error(e);
    }
  }

  refreshBtn.addEventListener('click', () => loadList());

  // Load count on first load
  if (isConfigured()) {
    loadList(true);
  }
})();
