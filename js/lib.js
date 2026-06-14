/* lib.js — math (Black-Scholes, binomial, payoffs) + canvas chart engine */

const Lib = (() => {

  // ---------- math ----------
  function normCdf(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }
  function normPdf(x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); }

  // Black-Scholes-Merton with continuous dividend yield q. T in years, sigma & r decimal.
  function bsm(type, S, K, T, r, sigma, q = 0) {
    if (T <= 0) {
      const intrinsic = type === 'call' ? Math.max(S - K, 0) : Math.max(K - S, 0);
      return { price: intrinsic, delta: type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0 };
    }
    const sq = sigma * Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + sigma * sigma / 2) * T) / sq;
    const d2 = d1 - sq;
    const eq = Math.exp(-q * T), er = Math.exp(-r * T);
    let price, delta, rho, theta;
    if (type === 'call') {
      price = S * eq * normCdf(d1) - K * er * normCdf(d2);
      delta = eq * normCdf(d1);
      rho = K * T * er * normCdf(d2) / 100;
      theta = (-S * eq * normPdf(d1) * sigma / (2 * Math.sqrt(T)) - r * K * er * normCdf(d2) + q * S * eq * normCdf(d1)) / 365;
    } else {
      price = K * er * normCdf(-d2) - S * eq * normCdf(-d1);
      delta = -eq * normCdf(-d1);
      rho = -K * T * er * normCdf(-d2) / 100;
      theta = (-S * eq * normPdf(d1) * sigma / (2 * Math.sqrt(T)) + r * K * er * normCdf(-d2) - q * S * eq * normCdf(-d1)) / 365;
    }
    const gamma = eq * normPdf(d1) / (S * sq);
    const vega = S * eq * normPdf(d1) * Math.sqrt(T) / 100;
    return { price, delta, gamma, theta, vega, rho, d1, d2 };
  }

  // CRR binomial tree (European or American)
  function binomial(type, S, K, T, r, sigma, steps = 100, american = false) {
    const dt = T / steps;
    const u = Math.exp(sigma * Math.sqrt(dt)), d = 1 / u;
    const p = (Math.exp(r * dt) - d) / (u - d);
    const disc = Math.exp(-r * dt);
    let vals = [];
    for (let i = 0; i <= steps; i++) {
      const ST = S * Math.pow(u, steps - i) * Math.pow(d, i);
      vals.push(type === 'call' ? Math.max(ST - K, 0) : Math.max(K - ST, 0));
    }
    for (let step = steps - 1; step >= 0; step--) {
      for (let i = 0; i <= step; i++) {
        vals[i] = disc * (p * vals[i] + (1 - p) * vals[i + 1]);
        if (american) {
          const ST = S * Math.pow(u, step - i) * Math.pow(d, i);
          const ex = type === 'call' ? Math.max(ST - K, 0) : Math.max(K - ST, 0);
          vals[i] = Math.max(vals[i], ex);
        }
      }
    }
    return { price: vals[0], u, d, p };
  }

  // Payoff at expiry of one leg at spot ST.
  // leg: {kind:'call'|'put'|'stock'|'fut', pos:+1|-1, K, prem, qty=1, entry}
  function legPayoff(leg, ST) {
    const q = leg.qty || 1;
    if (leg.kind === 'stock' || leg.kind === 'fut') return leg.pos * (ST - leg.entry) * q;
    const intrinsic = leg.kind === 'call' ? Math.max(ST - leg.K, 0) : Math.max(leg.K - ST, 0);
    return leg.pos * (intrinsic - leg.prem) * q;
  }
  function strategyPayoff(legs, ST) { return legs.reduce((s, l) => s + legPayoff(l, ST), 0); }

  // Current mark-to-market value (T+0 line) of strategy using BSM
  function strategyValueNow(legs, ST, T, r, sigma) {
    return legs.reduce((s, l) => {
      const q = l.qty || 1;
      if (l.kind === 'stock' || l.kind === 'fut') return s + l.pos * (ST - l.entry) * q;
      const v = bsm(l.kind, ST, l.K, T, r, sigma).price;
      return s + l.pos * (v - l.prem) * q;
    }, 0);
  }

  // Find breakevens by scanning
  function breakevens(legs, lo, hi) {
    const out = [], n = 800;
    let prev = strategyPayoff(legs, lo);
    for (let i = 1; i <= n; i++) {
      const x = lo + (hi - lo) * i / n;
      const y = strategyPayoff(legs, x);
      if ((prev < 0 && y >= 0) || (prev > 0 && y <= 0)) {
        const x0 = lo + (hi - lo) * (i - 1) / n;
        out.push(x0 + (x - x0) * (-prev) / (y - prev));
      }
      prev = y;
    }
    return out;
  }

  function maxProfitLoss(legs, lo, hi) {
    let mx = -Infinity, mn = Infinity;
    for (let i = 0; i <= 600; i++) {
      const y = strategyPayoff(legs, lo + (hi - lo) * i / 600);
      if (y > mx) mx = y; if (y < mn) mn = y;
    }
    // detect unbounded edges
    const yHi = strategyPayoff(legs, hi), yHi2 = strategyPayoff(legs, hi * 1.5);
    const yLo = strategyPayoff(legs, Math.max(lo * 0.5, 0.01)), yLo1 = strategyPayoff(legs, lo);
    const unboundedUp = yHi2 > yHi + 1e-9;
    const unboundedDownProfit = yLo > yLo1 + 1e-9 && yLo1 === mx;
    const unboundedLossUp = yHi2 < yHi - 1e-9;
    return {
      maxProfit: unboundedUp ? Infinity : mx,
      maxLoss: unboundedLossUp ? -Infinity : mn
    };
  }

  // ---------- chart engine ----------
  function setupCanvas(canvas, hCss = 320) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || 700;
    canvas.width = w * dpr; canvas.height = hCss * dpr;
    canvas.style.height = hCss + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h: hCss };
  }

  // Draw payoff chart. opts: {legs, lo, hi, spot, T, r, sigma, showNow}
  function drawPayoff(canvas, opts) {
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 320);
    const pad = { l: 56, r: 16, t: 14, b: 30 };
    const lo = opts.lo, hi = opts.hi;
    const n = 240;
    const xs = [], yExp = [], yNow = [];
    for (let i = 0; i <= n; i++) {
      const x = lo + (hi - lo) * i / n;
      xs.push(x);
      yExp.push(strategyPayoff(opts.legs, x));
      if (opts.showNow) yNow.push(strategyValueNow(opts.legs, x, opts.T, opts.r, opts.sigma));
    }
    let yMin = Math.min(...yExp, ...(opts.showNow ? yNow : [0]), 0);
    let yMax = Math.max(...yExp, ...(opts.showNow ? yNow : [0]), 0);
    const span = (yMax - yMin) || 1; yMin -= span * .12; yMax += span * .12;

    const X = v => pad.l + (v - lo) / (hi - lo) * (w - pad.l - pad.r);
    const Y = v => pad.t + (yMax - v) / (yMax - yMin) * (h - pad.t - pad.b);

    ctx.clearRect(0, 0, w, h);
    // grid
    ctx.strokeStyle = 'rgba(38,45,69,.55)'; ctx.lineWidth = 1; ctx.font = '11px Menlo, monospace'; ctx.fillStyle = '#8a93ad';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const v = yMin + (yMax - yMin) * i / ySteps;
      ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
      ctx.fillText(fmt(v), 6, Y(v) + 4);
    }
    const xSteps = 6;
    for (let i = 0; i <= xSteps; i++) {
      const v = lo + (hi - lo) * i / xSteps;
      ctx.fillText(fmt(v), X(v) - 14, h - 10);
    }
    // zero line
    ctx.strokeStyle = 'rgba(138,147,173,.8)'; ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(w - pad.r, Y(0)); ctx.stroke();

    // profit/loss fill at expiry
    ctx.beginPath(); ctx.moveTo(X(xs[0]), Y(0));
    xs.forEach((x, i) => ctx.lineTo(X(x), Y(Math.max(yExp[i], 0))));
    ctx.lineTo(X(xs[n]), Y(0)); ctx.closePath();
    ctx.fillStyle = 'rgba(34,196,126,.13)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(X(xs[0]), Y(0));
    xs.forEach((x, i) => ctx.lineTo(X(x), Y(Math.min(yExp[i], 0))));
    ctx.lineTo(X(xs[n]), Y(0)); ctx.closePath();
    ctx.fillStyle = 'rgba(244,81,92,.13)'; ctx.fill();

    // T+0 curve
    if (opts.showNow) {
      ctx.strokeStyle = '#f5a623'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath();
      xs.forEach((x, i) => i ? ctx.lineTo(X(x), Y(yNow[i])) : ctx.moveTo(X(x), Y(yNow[i])));
      ctx.stroke(); ctx.setLineDash([]);
    }
    // expiry payoff line
    ctx.strokeStyle = '#4f8cff'; ctx.lineWidth = 2.4; ctx.beginPath();
    xs.forEach((x, i) => i ? ctx.lineTo(X(x), Y(yExp[i])) : ctx.moveTo(X(x), Y(yExp[i])));
    ctx.stroke();

    // spot marker
    if (opts.spot != null) {
      ctx.strokeStyle = 'rgba(45,212,191,.8)'; ctx.setLineDash([3, 4]); ctx.beginPath();
      ctx.moveTo(X(opts.spot), pad.t); ctx.lineTo(X(opts.spot), h - pad.b); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#2dd4bf'; ctx.fillText('spot ' + fmt(opts.spot), X(opts.spot) + 5, pad.t + 12);
    }
    // breakevens
    breakevens(opts.legs, lo, hi).forEach(be => {
      ctx.fillStyle = '#e6e9f2';
      ctx.beginPath(); ctx.arc(X(be), Y(0), 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a93ad'; ctx.fillText('BE ' + fmt(be), X(be) - 22, Y(0) - 9);
    });
  }

  // simple line chart: series=[{xs,ys,color,dash}]
  function drawLines(canvas, series, opts = {}) {
    const { ctx, w, h } = setupCanvas(canvas, opts.height || 280);
    const pad = { l: 56, r: 14, t: 12, b: 28 };
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    series.forEach(s => s.xs.forEach((x, i) => {
      if (x < xMin) xMin = x; if (x > xMax) xMax = x;
      const y = s.ys[i]; if (y < yMin) yMin = y; if (y > yMax) yMax = y;
    }));
    if (opts.zero) { yMin = Math.min(yMin, 0); yMax = Math.max(yMax, 0); }
    const sp = (yMax - yMin) || 1; yMin -= sp * .08; yMax += sp * .08;
    const X = v => pad.l + (v - xMin) / (xMax - xMin) * (w - pad.l - pad.r);
    const Y = v => pad.t + (yMax - v) / (yMax - yMin) * (h - pad.t - pad.b);
    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px Menlo, monospace'; ctx.fillStyle = '#8a93ad'; ctx.strokeStyle = 'rgba(38,45,69,.55)';
    for (let i = 0; i <= 5; i++) {
      const v = yMin + (yMax - yMin) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
      ctx.fillText(fmt(v), 6, Y(v) + 4);
    }
    for (let i = 0; i <= 6; i++) {
      const v = xMin + (xMax - xMin) * i / 6;
      ctx.fillText(fmt(v), X(v) - 12, h - 9);
    }
    series.forEach(s => {
      ctx.strokeStyle = s.color || '#4f8cff'; ctx.lineWidth = s.width || 2;
      if (s.dash) ctx.setLineDash(s.dash);
      ctx.beginPath();
      s.xs.forEach((x, i) => i ? ctx.lineTo(X(x), Y(s.ys[i])) : ctx.moveTo(X(x), Y(s.ys[i])));
      ctx.stroke(); ctx.setLineDash([]);
    });
  }

  // SVG candlestick renderer. candles=[{o,h,l,c}], returns svg string. 0..100 viewBox height
  function candleSvg(candles, w = 250, h = 110) {
    const all = candles.flatMap(c => [c.h, c.l]);
    const hi = Math.max(...all), lo = Math.min(...all);
    const Y = v => 8 + (hi - v) / (hi - lo || 1) * (h - 16);
    const n = candles.length, cw = Math.min(26, (w - 20) / n * 0.55);
    let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">`;
    candles.forEach((c, i) => {
      const x = 10 + (w - 20) * (i + 0.5) / n;
      const up = c.c >= c.o;
      const col = up ? '#22c47e' : '#f4515c';
      s += `<line x1="${x}" y1="${Y(c.h)}" x2="${x}" y2="${Y(c.l)}" stroke="${col}" stroke-width="1.6"/>`;
      const top = Y(Math.max(c.o, c.c)), bot = Y(Math.min(c.o, c.c));
      s += `<rect x="${x - cw / 2}" y="${top}" width="${cw}" height="${Math.max(bot - top, 1.5)}" fill="${up ? col : col}" rx="1.5" ${up ? 'fill-opacity="0.95"' : ''}/>`;
    });
    return s + '</svg>';
  }

  function fmt(v) {
    if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
    const a = Math.abs(v);
    if (a >= 100000) return (v / 1000).toFixed(0) + 'k';
    if (a >= 1000) return v.toFixed(0);
    if (a >= 100) return v.toFixed(1);
    return v.toFixed(2);
  }
  function money(v) {
    if (!isFinite(v)) return v > 0 ? 'Unlimited' : 'Unlimited';
    return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  return { normCdf, bsm, binomial, legPayoff, strategyPayoff, strategyValueNow, breakevens, maxProfitLoss, drawPayoff, drawLines, candleSvg, fmt, money };
})();
