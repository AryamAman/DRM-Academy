/* ui.js — interactive widgets: labs, calculators, explorers */

const UI = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };

  function slider(id, label, min, max, step, val, unit = '') {
    return `<div class="ctrl"><label>${label} <span class="val" id="${id}V">${val}${unit}</span></label>
      <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
  }
  function bindSliders(root, ids, onChange) {
    ids.forEach(id => {
      const inp = $('#' + id, root);
      inp.addEventListener('input', () => { $('#' + id + 'V', root).textContent = inp.value; onChange(); });
    });
  }
  const num = (root, id) => parseFloat($('#' + id, root).value);

  /* ---------- Strategy Lab (payoff explorer for a strategy) ---------- */
  function strategyLab(container, strat) {
    container.innerHTML = `
      <div class="controls">
        ${slider('labSpot', 'Spot price', 500, 5000, 50, 2200)}
        ${slider('labIv', 'Implied volatility %', 8, 90, 1, 25)}
        ${slider('labDte', 'Days to expiry', 1, 120, 1, 30)}
        ${slider('labR', 'Risk-free rate %', 0, 12, 0.25, 6.5)}
      </div>
      <canvas class="chart" id="labChart"></canvas>
      <div class="chart-legend"><span class="leg-exp">P&L at expiry</span><span class="leg-now">P&L today (T+0, mark-to-market)</span><span class="leg-be">● breakeven</span></div>
      <div class="stat-row" id="labStats"></div>
      <h3>Position legs (auto-priced with Black-Scholes)</h3>
      <div class="legs-box" id="labLegs"></div>`;
    const redraw = () => {
      const S = num(container, 'labSpot'), sigma = num(container, 'labIv') / 100,
            T = num(container, 'labDte') / 365, r = num(container, 'labR') / 100;
      const P = (kind, K) => Lib.bsm(kind, S, K, T, r, sigma).price;
      const legs = strat.build(S, P);
      const lo = S * 0.75, hi = S * 1.25;
      Lib.drawPayoff($('#labChart', container), { legs, lo, hi, spot: S, T, r, sigma, showNow: true });
      const { maxProfit, maxLoss } = Lib.maxProfitLoss(legs, lo, hi);
      const bes = Lib.breakevens(legs, lo, hi);
      const net = legs.reduce((s, l) => s + (l.kind === 'stock' || l.kind === 'fut' ? 0 : -l.pos * l.prem * (l.qty || 1)), 0);
      $('#labStats', container).innerHTML = `
        <div class="stat"><div class="k">Max profit</div><div class="v pos">${maxProfit === Infinity ? 'Unlimited' : Lib.fmt(maxProfit)}</div></div>
        <div class="stat"><div class="k">Max loss</div><div class="v neg">${maxLoss === -Infinity ? 'Unlimited' : Lib.fmt(maxLoss)}</div></div>
        <div class="stat"><div class="k">Breakeven(s)</div><div class="v">${bes.length ? bes.map(Lib.fmt).join(' / ') : '—'}</div></div>
        <div class="stat"><div class="k">Net ${net >= 0 ? 'credit' : 'debit'}</div><div class="v">${Lib.fmt(Math.abs(net))}</div></div>`;
      $('#labLegs', container).innerHTML = legs.map(l => {
        const side = l.pos > 0 ? 'BUY' : 'SELL';
        const cls = l.pos > 0 ? 'leg-buy' : 'leg-sell';
        const q = Math.abs(l.pos) > 1 ? ` ×${Math.abs(l.pos)}` : '';
        if (l.kind === 'stock') return `<div class="leg-line ${cls}">${side}${q} STOCK @ ${Lib.fmt(l.entry)}</div>`;
        return `<div class="leg-line ${cls}">${side}${q} ${l.kind.toUpperCase()} K=${l.K} @ premium ${Lib.fmt(l.prem)}</div>`;
      }).join('');
    };
    bindSliders(container, ['labSpot', 'labIv', 'labDte', 'labR'], redraw);
    redraw();
  }

  /* ---------- BSM pricing lab ---------- */
  function bsmLab(container) {
    container.innerHTML = `
      <div class="controls">
        ${slider('bS', 'Spot', 100, 5000, 10, 2200)} ${slider('bK', 'Strike', 100, 5000, 10, 2250)}
        ${slider('bT', 'Days to expiry', 1, 365, 1, 30)} ${slider('bV', 'Volatility %', 5, 100, 1, 25)}
        ${slider('bR', 'Rate %', 0, 12, 0.25, 6.5)} ${slider('bQ', 'Dividend yield %', 0, 8, 0.25, 1)}
      </div>
      <div class="grid2">
        <div class="card"><div class="card-title">📞 Call</div><div id="bsmCall"></div></div>
        <div class="card"><div class="card-title">📩 Put</div><div id="bsmPut"></div></div>
      </div>
      <div class="card note"><div class="card-title">Put-Call Parity check</div><div id="bsmParity"></div></div>
      <h3>Option value vs spot (time value melts to intrinsic)</h3>
      <canvas class="chart" id="bsmChart"></canvas>
      <div class="chart-legend"><span class="leg-exp">Call value today</span><span class="leg-now">Call intrinsic (at expiry)</span></div>`;
    const greekRow = (g) => `
      <table><tr><td>Price</td><td class="num">${g.price.toFixed(2)}</td></tr>
      <tr><td>Delta <span class="mono">Δ</span> — move per ₹1 of spot</td><td class="num">${g.delta.toFixed(4)}</td></tr>
      <tr><td>Gamma <span class="mono">Γ</span> — delta change per ₹1</td><td class="num">${g.gamma.toFixed(6)}</td></tr>
      <tr><td>Theta <span class="mono">Θ</span> — decay per day</td><td class="num neg">${g.theta.toFixed(3)}</td></tr>
      <tr><td>Vega — per 1% IV change</td><td class="num">${g.vega.toFixed(3)}</td></tr>
      <tr><td>Rho — per 1% rate change</td><td class="num">${g.rho.toFixed(3)}</td></tr></table>`;
    const redraw = () => {
      const S = num(container, 'bS'), K = num(container, 'bK'), T = num(container, 'bT') / 365,
            r = num(container, 'bR') / 100, v = num(container, 'bV') / 100, q = num(container, 'bQ') / 100;
      const c = Lib.bsm('call', S, K, T, r, v, q), p = Lib.bsm('put', S, K, T, r, v, q);
      $('#bsmCall', container).innerHTML = greekRow(c);
      $('#bsmPut', container).innerHTML = greekRow(p);
      const lhs = c.price - p.price, rhs = S * Math.exp(-q * T) - K * Math.exp(-r * T);
      $('#bsmParity', container).innerHTML =
        `C − P = <b class="num">${lhs.toFixed(2)}</b> &nbsp;|&nbsp; S·e<sup>−qT</sup> − K·e<sup>−rT</sup> = <b class="num">${rhs.toFixed(2)}</b>
         &nbsp;→&nbsp; ${Math.abs(lhs - rhs) < 0.05 ? '<span class="pos">Parity holds ✓ (no arbitrage)</span>' : '<span class="neg">Mispricing → arbitrage opportunity!</span>'}
         <p style="margin-top:6px;font-size:13px">In live markets, scan C − P vs S − PV(K) across the option chain — persistent gaps wider than transaction costs are free money, which is why they vanish in seconds.</p>`;
      const xs = [], now = [], intr = [];
      for (let i = 0; i <= 120; i++) { const x = S * 0.7 + S * 0.6 * i / 120; xs.push(x); now.push(Lib.bsm('call', x, K, T, r, v, q).price); intr.push(Math.max(x - K, 0)); }
      Lib.drawLines($('#bsmChart', container), [
        { xs, ys: intr, color: '#f5a623', dash: [5, 4] }, { xs, ys: now, color: '#4f8cff', width: 2.4 }
      ], { zero: true });
    };
    bindSliders(container, ['bS', 'bK', 'bT', 'bV', 'bR', 'bQ'], redraw);
    redraw();
  }

  /* ---------- Futures: margin / mark-to-market simulator ---------- */
  function marginSim(container) {
    container.innerHTML = `
      <div class="controls">
        ${slider('mEntry', 'Futures entry price', 1000, 3000, 5, 2285)}
        ${slider('mLot', 'Lot size', 25, 1000, 25, 250)}
        ${slider('mIM', 'Initial margin %', 5, 25, 1, 12)}
        ${slider('mVol', 'Daily volatility %', 0.5, 5, 0.25, 1.5)}
      </div>
      <button class="btn" id="mRun">▶ Simulate 10 trading days</button>
      <div id="mOut" style="margin-top:14px"></div>`;
    $('#mRun', container).addEventListener('click', () => {
      const entry = num(container, 'mEntry'), lot = num(container, 'mLot'),
            imPct = num(container, 'mIM') / 100, vol = num(container, 'mVol') / 100;
      const im = entry * lot * imPct, mm = im * 0.75;
      let price = entry, bal = im, rows = '', calls = 0;
      for (let d = 1; d <= 10; d++) {
        const prev = price;
        price = Math.max(1, price * (1 + (Math.random() * 2 - 1) * vol));
        const pnl = (price - prev) * lot;
        bal += pnl;
        let action = '—';
        if (bal < mm) { const top = im - bal; calls++; action = `<span class="neg">MARGIN CALL: deposit ${Lib.money(top)}</span>`; bal = im; }
        rows += `<tr><td>${d}</td><td class="num">${price.toFixed(2)}</td>
          <td class="${pnl >= 0 ? 'pos' : 'neg'}">${pnl >= 0 ? '+' : ''}${Lib.fmt(pnl)}</td>
          <td class="num">${Lib.fmt(bal)}</td><td>${action}</td></tr>`;
      }
      const total = (price - entry) * lot;
      $('#mOut', container).innerHTML = `
        <div class="stat-row">
          <div class="stat"><div class="k">Initial margin (blocked)</div><div class="v">${Lib.money(im)}</div></div>
          <div class="stat"><div class="k">Maintenance margin</div><div class="v">${Lib.money(mm)}</div></div>
          <div class="stat"><div class="k">10-day net P&L (long)</div><div class="v ${total >= 0 ? 'pos' : 'neg'}">${Lib.money(total)}</div></div>
          <div class="stat"><div class="k">Margin calls</div><div class="v">${calls}</div></div>
        </div>
        <table><tr><th>Day</th><th>Settle price</th><th>Daily M2M P&L</th><th>Margin balance</th><th>Action</th></tr>${rows}</table>
        <p style="font-size:13px;color:var(--muted)">Every evening the exchange marks your position to the settlement price and moves real cash. This daily settlement is what makes futures nearly default-free — and what makes leverage dangerous: a 2% adverse day on ~12% margin is a 16% hit to your capital.</p>`;
    });
  }

  /* ---------- Beta hedge calculator (from course notes) ---------- */
  function betaHedge(container) {
    container.innerHTML = `
      <div class="controls">
        ${slider('hV', 'Portfolio value (₹ lakh)', 5, 500, 5, 95.5)}
        ${slider('hB', 'Portfolio beta', 0.2, 2.5, 0.05, 1.25)}
        ${slider('hF', 'Index futures price', 5000, 30000, 25, 9025)}
        ${slider('hL', 'Lot size', 15, 250, 5, 75)}
        ${slider('hTB', 'Target beta (0 = full hedge)', 0, 2.5, 0.05, 0)}
      </div>
      <div class="stat-row" id="hOut"></div>
      <p style="font-size:13px;color:var(--muted)">Formula from your notes: contracts = (β<sub>target</sub> − β) × V<sub>A</sub> / V<sub>F</sub>. Negative = SHORT futures (reduce beta), positive = LONG futures (lever up). Hedging keeps your stock-picking alpha while neutralizing market direction — you earn the risk-free rate plus your excess return over the market.</p>`;
    const redraw = () => {
      const VA = num(container, 'hV') * 100000, b = num(container, 'hB'),
            F = num(container, 'hF'), L = num(container, 'hL'), tb = num(container, 'hTB');
      const VF = F * L;
      const n = (tb - b) * VA / VF;
      $('#hOut', container).innerHTML = `
        <div class="stat"><div class="k">Value of one futures lot</div><div class="v">${Lib.money(VF)}</div></div>
        <div class="stat"><div class="k">Contracts needed</div><div class="v ${n < 0 ? 'neg' : 'pos'}">${n < 0 ? 'SHORT ' : 'LONG '}${Math.abs(n).toFixed(1)} → ${Math.round(Math.abs(n))}</div></div>
        <div class="stat"><div class="k">Hedge notional</div><div class="v">${Lib.money(Math.abs(Math.round(n)) * VF)}</div></div>`;
    };
    bindSliders(container, ['hV', 'hB', 'hF', 'hL', 'hTB'], redraw);
    redraw();
  }

  /* ---------- Optimal hedge ratio calculator ---------- */
  function optimalHedge(container) {
    container.innerHTML = `
      <div class="controls">
        ${slider('oS', 'σ of spot changes (×0.0001)', 50, 800, 1, 263)}
        ${slider('oF', 'σ of futures changes (×0.0001)', 50, 800, 1, 313)}
        ${slider('oR', 'Correlation ρ', 0, 1, 0.01, 0.93)}
        ${slider('oQ', 'Exposure (units, ×1000)', 10, 5000, 10, 2000)}
        ${slider('oC', 'Contract size (units, ×1000)', 1, 100, 1, 42)}
      </div>
      <div class="stat-row" id="oOut"></div>
      <p style="font-size:13px;color:var(--muted)">h* = ρ·σ<sub>S</sub>/σ<sub>F</sub>. Your notes’ airline example: hedging jet fuel with heating-oil futures (cross hedge) → h* = 0.928×0.0263/0.0313 = 0.78 → 0.78×2,000,000/42,000 ≈ 37 contracts. Use this whenever the futures contract is not on the exact asset you hold.</p>`;
    const redraw = () => {
      const ss = num(container, 'oS') / 10000, sf = num(container, 'oF') / 10000, rho = num(container, 'oR');
      const QA = num(container, 'oQ') * 1000, QF = num(container, 'oC') * 1000;
      const h = rho * ss / sf, n = h * QA / QF;
      $('#oOut', container).innerHTML = `
        <div class="stat"><div class="k">Optimal hedge ratio h*</div><div class="v">${h.toFixed(3)}</div></div>
        <div class="stat"><div class="k">Optimal # contracts</div><div class="v">${n.toFixed(1)} → ${Math.round(n)}</div></div>
        <div class="stat"><div class="k">Hedge effectiveness ρ²</div><div class="v">${(rho * rho * 100).toFixed(0)}%</div></div>`;
    };
    bindSliders(container, ['oS', 'oF', 'oR', 'oQ', 'oC'], redraw);
    redraw();
  }

  /* ---------- TVM calculator ---------- */
  function tvmCalc(container) {
    container.innerHTML = `
      <div class="controls">
        ${slider('tP', 'Amount (₹)', 1000, 1000000, 1000, 100000)}
        ${slider('tR', 'Rate % p.a.', 1, 20, 0.25, 8)}
        ${slider('tN', 'Years', 1, 30, 1, 5)}
        <div class="ctrl"><label>Compounding</label>
          <select id="tC"><option value="1">Annual</option><option value="2">Semi-annual</option><option value="4">Quarterly</option><option value="12">Monthly</option><option value="0">Continuous</option></select></div>
      </div>
      <div class="stat-row" id="tOut"></div>
      <canvas class="chart" id="tChart" style="height:240px"></canvas>`;
    const redraw = () => {
      const P = num(container, 'tP'), r = num(container, 'tR') / 100, n = num(container, 'tN');
      const m = parseFloat($('#tC', container).value);
      const grow = (t) => m === 0 ? P * Math.exp(r * t) : P * Math.pow(1 + r / m, m * t);
      const FV = grow(n), PV = m === 0 ? P * Math.exp(-r * n) : P / Math.pow(1 + r / m, m * n);
      $('#tOut', container).innerHTML = `
        <div class="stat"><div class="k">Future value of ₹${Lib.fmt(P)}</div><div class="v pos">${Lib.money(FV)}</div></div>
        <div class="stat"><div class="k">Present value of ₹${Lib.fmt(P)} in ${n}y</div><div class="v">${Lib.money(PV)}</div></div>
        <div class="stat"><div class="k">Effective annual rate</div><div class="v">${((m === 0 ? Math.exp(r) : Math.pow(1 + r / m, m)) - 1).toFixed(4).replace('0.', '') / 100 + ''}${(((m === 0 ? Math.exp(r) : Math.pow(1 + r / m, m)) - 1) * 100).toFixed(2)}%</div></div>`;
      $('#tOut .stat:last-child .v', container).textContent = (((m === 0 ? Math.exp(r) : Math.pow(1 + r / m, m)) - 1) * 100).toFixed(2) + '%';
      const xs = [], ys = [], ysSimple = [];
      for (let i = 0; i <= 60; i++) { const t = n * i / 60; xs.push(t); ys.push(grow(t)); ysSimple.push(P * (1 + r * t)); }
      Lib.drawLines($('#tChart', container), [
        { xs, ys: ysSimple, color: '#8a93ad', dash: [4, 4] }, { xs, ys, color: '#22c47e', width: 2.4 }
      ]);
    };
    bindSliders(container, ['tP', 'tR', 'tN'], redraw);
    $('#tC', container).addEventListener('change', redraw);
    redraw();
  }

  /* ---------- Position size calculator ---------- */
  function positionSize(container) {
    container.innerHTML = `
      <div class="controls">
        ${slider('pCap', 'Trading capital (₹ lakh)', 1, 200, 1, 10)}
        ${slider('pRisk', 'Risk per trade %', 0.25, 5, 0.25, 1)}
        ${slider('pEntry', 'Entry price', 10, 5000, 5, 2200)}
        ${slider('pStop', 'Stop loss price', 10, 5000, 5, 2120)}
      </div>
      <div class="stat-row" id="pOut"></div>`;
    const redraw = () => {
      const cap = num(container, 'pCap') * 100000, riskPct = num(container, 'pRisk') / 100;
      const entry = num(container, 'pEntry'), stop = num(container, 'pStop');
      const perShare = Math.abs(entry - stop), riskAmt = cap * riskPct;
      const qty = perShare > 0 ? Math.floor(riskAmt / perShare) : 0;
      $('#pOut', container).innerHTML = `
        <div class="stat"><div class="k">Max risk this trade</div><div class="v neg">${Lib.money(riskAmt)}</div></div>
        <div class="stat"><div class="k">Risk per share</div><div class="v">${Lib.fmt(perShare)}</div></div>
        <div class="stat"><div class="k">Position size</div><div class="v pos">${qty.toLocaleString('en-IN')} shares</div></div>
        <div class="stat"><div class="k">Position value</div><div class="v">${Lib.money(qty * entry)} (${cap ? (qty * entry / cap * 100).toFixed(0) : 0}% of capital)</div></div>`;
    };
    bindSliders(container, ['pCap', 'pRisk', 'pEntry', 'pStop'], redraw);
    redraw();
  }

  /* ---------- Strategy selector wizard ---------- */
  function wizard(container) {
    container.innerHTML = `
      <div class="controls">
        <div class="ctrl"><label>Your market view</label>
          <select id="wView"><option value="bull">Bullish</option><option value="bear">Bearish</option>
          <option value="neutral">Neutral / range-bound</option><option value="vol">Big move coming (direction unknown)</option>
          <option value="income">I own stock, want income/protection</option></select></div>
        <div class="ctrl"><label>Implied volatility right now</label>
          <select id="wIv"><option value="low">Low (IV rank &lt; 30)</option><option value="high">High (IV rank &gt; 50)</option><option value="any">Mid / unsure</option></select></div>
        <div class="ctrl"><label>Risk appetite</label>
          <select id="wRisk"><option value="defined">Defined risk only</option><option value="open">Comfortable with margin / open risk</option></select></div>
      </div>
      <div id="wOut"></div>`;
    const redraw = () => {
      const view = $('#wView', container).value, iv = $('#wIv', container).value, riskTol = $('#wRisk', container).value;
      let list = STRATEGIES.filter(s => s.view === view || (view === 'income' && s.view === 'income'));
      list = list.filter(s => iv === 'any' || s.iv === iv || s.iv === 'any');
      if (riskTol === 'defined') list = list.filter(s => !/Unlimited|Substantial/i.test(s.risk) || /cushioned/.test(s.risk));
      if (!list.length) list = STRATEGIES.filter(s => s.view === view);
      $('#wOut', container).innerHTML = list.length ? `
        <p style="margin-top:8px">Recommended for this setup:</p>
        <div class="strat-grid">${list.map(s => `
          <div class="strat-card" onclick="App.go('strategies','${s.id}')">
            <h4>${s.name}</h4><div class="mini">${s.tagline}</div>
            <div style="margin-top:8px"><span class="pill ${VIEW_LABELS[s.view][0]}">${VIEW_LABELS[s.view][1]}</span></div>
          </div>`).join('')}</div>`
        : '<p>No exact match — loosen a constraint.</p>';
    };
    ['wView', 'wIv', 'wRisk'].forEach(id => $('#' + id, container).addEventListener('change', redraw));
    redraw();
  }

  /* ---------- Quiz ---------- */
  function quiz(container) {
    let score = 0, answered = 0;
    container.innerHTML = `<div id="qScore" class="stat-row">
      <div class="stat"><div class="k">Score</div><div class="v" id="qS">0 / ${QUIZ.length}</div></div></div>` +
      QUIZ.map((q, i) => `
      <div class="card"><div class="quiz-q">${i + 1}. ${q.q}</div>
        ${q.opts.map((o, j) => `<span class="quiz-opt" data-q="${i}" data-o="${j}">${o}</span>`).join('')}
        <div class="quiz-expl" id="qe${i}">${q.expl}</div></div>`).join('');
    container.querySelectorAll('.quiz-opt').forEach(opt => opt.addEventListener('click', () => {
      const qi = +opt.dataset.q, oi = +opt.dataset.o, q = QUIZ[qi];
      if (container.querySelector(`.quiz-opt[data-q="${qi}"].correct`)) return;
      container.querySelectorAll(`.quiz-opt[data-q="${qi}"]`).forEach((o, j) => {
        if (j === q.a) o.classList.add('correct');
        else if (j === oi) o.classList.add('wrong');
      });
      $('#qe' + qi, container).classList.add('show');
      answered++; if (oi === q.a) score++;
      $('#qS', container).textContent = `${score} / ${QUIZ.length}` + (answered === QUIZ.length ? (score >= 10 ? ' 🏆' : score >= 7 ? ' 👍' : ' — review & retry') : '');
    }));
  }

  /* ---------- Candle explorer ---------- */
  function candleExplorer(container) {
    const biasPill = b => b === 'bull' ? '<span class="pill bull">Bullish</span>' : b === 'bear' ? '<span class="pill bear">Bearish</span>' : b === 'trend' ? '<span class="pill income">Trend</span>' : '<span class="pill neutral">Neutral</span>';
    container.innerHTML = `<div class="candle-grid">${CANDLE_PATTERNS.map(p => `
      <div class="candle-card" data-id="${p.id}">${Lib.candleSvg(p.candles)}<h4>${p.name} ${biasPill(p.bias)}</h4>
      <div class="mini">${p.signal.slice(0, 90)}…</div></div>`).join('')}</div>
      <div id="candleDetail" style="margin-top:18px"></div>`;
    container.querySelectorAll('.candle-card').forEach(c => c.addEventListener('click', () => {
      const p = CANDLE_PATTERNS.find(x => x.id === c.dataset.id);
      const stratLinks = p.strategies.map(id => {
        const s = STRATEGIES.find(x => x.id === id);
        return s ? `<span class="quiz-opt" style="display:inline-block;margin-right:8px" onclick="App.go('strategies','${s.id}')">${s.name} →</span>` : '';
      }).join('');
      $('#candleDetail', container).innerHTML = `
        <div class="card" style="border-color:var(--accent)">
          <h3 style="margin-top:0">${p.name} ${biasPill(p.bias)}</h3>
          <p><strong>What it tells you:</strong> ${p.signal}</p>
          <p><strong>Confirmation required:</strong> ${p.confirm}</p>
          <p><strong>How to trade it with options:</strong> ${p.play}</p>
          <p><strong>Matching strategies:</strong></p>${stratLinks}
        </div>`;
      $('#candleDetail', container).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
  }

  return { $, el, slider, bindSliders, strategyLab, bsmLab, marginSim, betaHedge, optimalHedge, tvmCalc, positionSize, wizard, quiz, candleExplorer };
})();
