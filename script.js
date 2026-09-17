const FX = {
  'bg-remove':     { text: '배경 영역 검출 중...',     final: '배경 제거 완료',     thumb: 't1' },
  'upscale':       { text: '4× 해상도로 향상 중...',  final: '업스케일 완료',      thumb: 't4' },
  'restore':       { text: '오래된 사진 분석 중...',  final: '복원 완료',         thumb: 't3' },
  'colorize':      { text: 'AI가 색을 칠하는 중...',  final: '컬러 변환 완료',     thumb: 't2' },
  'object-remove': { text: '대상 영역 인페인팅 중...', final: '객체 제거 완료',     thumb: 't1' },
  'style':         { text: '유화 스타일 적용 중...',  final: '스타일 변환 완료',   thumb: 't5' },
};

const FILTERS = {
  none:    '',
  vivid:   'saturate(1.5) contrast(1.1)',
  mono:    'grayscale(1)',
  warm:    'sepia(.4) saturate(1.4) hue-rotate(-10deg)',
  cool:    'hue-rotate(180deg) saturate(.8)',
  vintage: 'sepia(.6) contrast(1.1) saturate(.7) brightness(.95)',
};

const img = document.getElementById('img');
const overlay = document.getElementById('overlay');
const oText = document.getElementById('oText');
const prog = document.getElementById('prog');
const pPct = document.getElementById('pPct');
const hist = document.getElementById('hist');
const appliedFilter = document.getElementById('appliedFilter');

let currentFilter = 'none';
const adj = { bright: 0, contrast: 0, saturate: 0, hue: 0 };

function applyStyle() {
  let f = FILTERS[currentFilter] || '';
  f += ` brightness(${1 + adj.bright / 100})`;
  f += ` contrast(${1 + adj.contrast / 100})`;
  f += ` saturate(${1 + adj.saturate / 100})`;
  f += ` hue-rotate(${adj.hue}deg)`;
  img.style.filter = f;
}

document.querySelectorAll('.filter').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    currentFilter = b.dataset.f;
    appliedFilter.textContent = '필터: ' + b.textContent;
    applyStyle();
  });
});

document.querySelectorAll('[data-adj]').forEach((s) => {
  s.addEventListener('input', () => {
    adj[s.dataset.adj] = parseInt(s.value, 10);
    applyStyle();
  });
});

document.querySelectorAll('.tool').forEach((t) => {
  t.addEventListener('click', () => {
    const fx = FX[t.dataset.fx];
    if (!fx) return;
    runAI(fx, t.querySelector('b').textContent);
  });
});

function runAI(fx, label) {
  overlay.hidden = false;
  oText.textContent = fx.text;
  prog.style.width = '0%';
  pPct.textContent = '0%';
  let p = 0;
  const total = 2500 + Math.random() * 1500;
  const start = Date.now();

  const stages = [
    { at: .15, t: '이미지 인코딩 중...' },
    { at: .35, t: fx.text },
    { at: .65, t: 'AI 모델 추론 중...' },
    { at: .85, t: '결과 디코딩 중...' },
  ];

  function tick() {
    const elapsed = Date.now() - start;
    p = Math.min(1, elapsed / total);
    prog.style.width = (p * 100) + '%';
    pPct.textContent = Math.floor(p * 100) + '%';
    const stage = stages.filter((s) => p >= s.at).pop();
    if (stage) oText.textContent = stage.t;
    if (p >= 1) {
      oText.textContent = fx.final + ' ✓';
      setTimeout(() => {
        overlay.hidden = true;
        addHistory(label, fx.thumb);
      }, 600);
      return;
    }
    requestAnimationFrame(tick);
  }
  tick();
}

function addHistory(label, thumbClass) {
  document.querySelectorAll('.hist').forEach((x) => x.classList.remove('active'));
  const li = document.createElement('li');
  li.className = 'hist active';
  li.innerHTML = `<div class="thumb ${thumbClass}"></div><div><b>${label}</b><span>방금 전</span></div>`;
  li.addEventListener('click', () => {
    document.querySelectorAll('.hist').forEach((x) => x.classList.remove('active'));
    li.classList.add('active');
  });
  hist.insertBefore(li, hist.firstChild);
  if (hist.children.length > 6) hist.removeChild(hist.lastChild);
}
