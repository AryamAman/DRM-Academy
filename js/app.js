/* app.js — router, navigation, lesson pages */

const App = (() => {
  const main = document.getElementById('main');
  const navEl = document.getElementById('nav');
  const PROGRESS_KEY = 'drm_progress_v1';
  let done = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');

  // ---------- site map ----------
  const NAV = [
    { group: 'Start here', items: [
      { id: 'home', ico: '🏠', label: 'Welcome & Roadmap' },
      { id: 'how-markets', ico: '🏛️', label: 'Markets & Participants' },
      { id: 'tvm', ico: '⏳', label: 'Time Value of Money' },
    ]},
    { group: 'Foundations', items: [
      { id: 'risk-return', ico: '⚖️', label: 'Risk & Return' },
      { id: 'candles', ico: '🕯️', label: 'Candlestick Playbook' },
      { id: 'position-sizing', ico: '🎯', label: 'Position Sizing & Risk' },
    ]},
    { group: 'Futures & Forwards', items: [
      { id: 'futures-intro', ico: '📜', label: 'Futures & Forwards' },
      { id: 'margin', ico: '💳', label: 'Margin & Mark-to-Market' },
      { id: 'hedging', ico: '🛡️', label: 'Hedging with Futures' },
    ]},
    { group: 'Options', items: [
      { id: 'options-intro', ico: '🔑', label: 'Options Basics' },
      { id: 'greeks', ico: '🧮', label: 'Pricing & The Greeks' },
      { id: 'strategies', ico: '�split', label: 'Strategy Lab (24)' },
      { id: 'wizard', ico: '🧭', label: 'Strategy Selector' },
    ]},
    { group: 'Putting it together', items: [
      { id: 'playbook', ico: '📖', label: 'Real-World Playbook' },
      { id: 'risk-rules', ico: '🚦', label: 'Risk Management Rules' },
      { id: 'quiz', ico: '✅', label: 'Test Yourself' },
    ]},
  ];

  // ---------- helpers ----------
  const widget = (id, h = 320) => `<canvas class="chart" id="${id}" style="height:${h}px"></canvas>`;
  const mount = (fn) => setTimeout(fn, 0);
  const lessonFooter = (id) => `<div class="mark-done"><button class="btn ${done.includes(id) ? 'ghost' : ''}" onclick="App.markDone('${id}')">${done.includes(id) ? '✓ Completed' : 'Mark lesson complete'}</button></div>`;

  // ---------- pages ----------
  const PAGES = {
    home: () => {
      const steps = [
        ['Markets & instruments', 'Where stocks, futures and options actually trade', 'how-markets'],
        ['Time value of money', 'Why ₹100 today ≠ ₹100 next year — the root of all pricing', 'tvm'],
        ['Risk & return', 'Measure both before you ever place a trade', 'risk-return'],
        ['Read the chart', 'Candlestick patterns and what they signal', 'candles'],
        ['Futures & hedging', 'Lock prices, protect portfolios, manage beta', 'hedging'],
        ['Options & the Greeks', 'Price options and understand what moves them', 'greeks'],
        ['Strategy Lab', 'All 24 strategies with live payoff diagrams', 'strategies'],
        ['The Playbook', 'Which strategy, when — tied to real chart setups', 'playbook'],
      ];
      return `
      <div class="hero">
        <h1>DRM Trading Academy</h1>
        <p class="lead">A hands-on guide to <strong>Derivatives, Risk & Management</strong> — built for <em>real</em> equity, futures and options trading, not just theory. Every concept is interactive: drag sliders, watch payoff diagrams move, simulate margin calls, and learn exactly which option strategy to deploy for each candlestick setup.</p>
        <button class="btn" onclick="App.go('how-markets')">Start learning →</button>
        <button class="btn ghost" onclick="App.go('strategies')">Jump to Strategy Lab</button>
      </div>
      <div class="grid3">
        <div class="card tip"><div class="card-title">📊 24 Option Strategies</div>Every strategy from your course notes + modern income trades, each with a live Black-Scholes payoff explorer.</div>
        <div class="card note"><div class="card-title">🕯️ Candles → Strategy</div>12 candlestick patterns mapped to the exact options play to run when you see them.</div>
        <div class="card warn"><div class="card-title">🛡️ Real Risk Tools</div>Margin simulator, beta-hedge & optimal-hedge calculators, position sizing — the numbers that keep you solvent.</div>
      </div>
      <h2>Your learning path</h2>
      <div class="card">${steps.map((s, i) => `
        <div class="path-step" onclick="App.go('${s[2]}')">
          <div class="path-num">${done.includes(s[2]) ? '✓' : i + 1}</div>
          <div><div class="ps-title">${s[0]}</div><div class="ps-sub">${s[1]}</div></div>
        </div>`).join('')}</div>
      <div class="card warn"><div class="card-title">⚠️ Educational use only</div>This app teaches concepts with simulated/illustrative prices. It is not investment advice. Derivatives carry substantial risk of loss — never trade with money you cannot afford to lose, and start with paper trading.</div>`;
    },

    'how-markets': () => `
      <h1>Financial Markets & Participants</h1>
      <p class="lead">Before any strategy, know the playing field: where instruments trade, who you are trading against, and how derivatives relate to the underlying.</p>
      <h2>Two kinds of markets</h2>
      <div class="grid2">
        <div class="card"><div class="card-title">Exchange-traded</div>Standardised contracts, central clearing, daily settlement, transparent prices. Futures & options on NSE/BSE. Counterparty risk is taken by the clearing corporation — you never worry who is on the other side.</div>
        <div class="card"><div class="card-title">Over-the-counter (OTC)</div>Customised, bilateral deals — forwards, swaps. Flexible terms but you carry counterparty (default) risk and there is no daily margining.</div>
      </div>
      <h2>The instruments</h2>
      <table><tr><th>Instrument</th><th>What it is</th><th>Why traders use it</th></tr>
        <tr><td>Equity (stock)</td><td>Ownership share in a company</td><td>Long-term growth, dividends</td></tr>
        <tr><td>Bond</td><td>A loan to a company/government</td><td>Fixed income, lower risk</td></tr>
        <tr><td>Forward</td><td>OTC agreement to trade later at a set price</td><td>Custom hedging</td></tr>
        <tr><td>Future</td><td>Exchange-traded, standardised forward</td><td>Hedging, leverage, speculation</td></tr>
        <tr><td>Option</td><td>The <em>right</em> (not obligation) to buy/sell</td><td>Asymmetric payoffs, insurance</td></tr>
      </table>
      <div class="card note"><div class="card-title">Derivatives derive their value</div>A derivative’s price comes from an <strong>underlying</strong> — a stock, index, currency or commodity. Move the underlying and the derivative moves. That link is the entire game.</div>
      <h2>Who is in the market with you</h2>
      <div class="grid3">
        <div class="card"><div class="card-title">🛡️ Hedgers</div>Reduce existing risk (a farmer locking crop prices, a fund protecting a portfolio).</div>
        <div class="card"><div class="card-title">🎲 Speculators</div>Take on risk for profit, betting on direction or volatility. Provide liquidity.</div>
        <div class="card"><div class="card-title">⚖️ Arbitrageurs</div>Exploit price gaps between markets, keeping prices consistent. Their activity is why put-call parity holds.</div>
      </div>
      <div class="card tip"><div class="card-title">Investment vs hedging vs speculation</div><strong>Investing</strong> = buying assets for long-term value. <strong>Hedging</strong> = offsetting a risk you already have. <strong>Speculation</strong> = taking a new risk to profit from a view. The same future can serve all three depending on <em>why</em> you hold it.</div>
      ${lessonFooter('how-markets')}`,

    tvm: () => `
      <h1>Time Value of Money</h1>
      <p class="lead">₹100 today is worth more than ₹100 next year — you could invest it and earn interest. This single idea underlies bond pricing, the cost-of-carry in futures, and the discounting inside Black-Scholes.</p>
      <h2>The core formulas</h2>
      <div class="grid2">
        <div class="card"><div class="card-title">Future Value</div><code>FV = PV × (1 + r/m)^(m·t)</code><br>Continuous: <code>FV = PV × e^(r·t)</code><p style="margin-top:8px">How much your money grows to.</p></div>
        <div class="card"><div class="card-title">Present Value</div><code>PV = FV / (1 + r/m)^(m·t)</code><br>Continuous: <code>PV = FV × e^(−r·t)</code><p style="margin-top:8px">What a future cashflow is worth now — i.e. <em>discounting</em>.</p></div>
      </div>
      <h2>Try it — compounding & discounting</h2>
      <div id="tvm"></div>
      <div class="card tip"><div class="card-title">Why this matters for derivatives</div>The grey dashed line is <strong>simple</strong> interest, the green is <strong>compound</strong>. Notice how more frequent compounding (and continuous, <code>e^(rt)</code>) grows faster. Options pricing uses continuous compounding because it makes the math clean — every <code>e^(−rT)</code> you see in Black-Scholes is just discounting the strike back to today.</div>
      ${lessonFooter('tvm')}`,

    'risk-return': () => `
      <h1>Risk & Return</h1>
      <p class="lead">Return rewards you; risk is what you pay for it. Professionals measure both <em>before</em> entering — never just the upside.</p>
      <h2>Measuring return</h2>
      <ul>
        <li><strong>Simple return</strong> = (P₁ − P₀ + dividends) / P₀</li>
        <li><strong>Log return</strong> = ln(P₁/P₀) — additive over time, used in volatility math</li>
        <li><strong>Annualising</strong>: daily σ × √252 ≈ annual σ (252 trading days)</li>
      </ul>
      <h2>Measuring risk</h2>
      <div class="grid2">
        <div class="card"><div class="card-title">Volatility (σ)</div>Standard deviation of returns. Higher σ = wider swings. This is the single most important input to option prices — it <em>is</em> implied volatility.</div>
        <div class="card"><div class="card-title">Beta (β)</div>Sensitivity to the market. β=1.5 means the stock moves ~1.5× the index. Drives how many futures you need to hedge (see Hedging).</div>
      </div>
      <h2>The risk-return tradeoff</h2>
      <div class="card">Higher expected return demands higher risk. Derivatives let you <strong>reshape</strong> that tradeoff: a protective put caps downside (lower risk) for a premium cost (slightly lower return); selling options harvests premium (steady return) while accepting tail risk. You are not stuck on the straight line — you can bend the payoff.</div>
      <div class="card note"><div class="card-title">Downside risk & derivatives</div>Options are the only instrument that lets you buy <em>insurance</em> on a position. A long put is literally a put-option insurance policy on your stock — defined cost, defined floor.</div>
      <h2>Fixed income & its derivatives</h2>
      <p>Bonds pay fixed coupons; their prices move <em>inversely</em> to interest rates. Interest-rate futures, FRAs and swaps (covered later) hedge this rate risk — the same hedging logic as equities, applied to rates.</p>
      ${lessonFooter('risk-return')}`,

    candles: () => `
      <h1>Candlestick Playbook</h1>
      <p class="lead">A candlestick compresses a session into one shape: open, high, low, close. Patterns reveal the <strong>balance of buyers vs sellers</strong> — and tell you which option strategy fits. Click any pattern.</p>
      <div class="card"><div class="card-title">Anatomy of a candle</div>The <strong>body</strong> spans open→close (green = up, red = down). The <strong>wicks</strong> show the high and low. A long lower wick = buyers rejected lower prices; a long upper wick = sellers rejected higher prices. <strong>Location is everything</strong> — the same candle means opposite things at support vs resistance.</div>
      <div id="candles"></div>
      <div class="card tip" style="margin-top:18px"><div class="card-title">Golden rule</div>Never trade a single candle in isolation. Demand (1) the pattern, (2) a meaningful <strong>level</strong> (support/resistance), (3) <strong>confirmation</strong> from the next candle, and ideally (4) volume. Three confluences beat one pretty shape.</div>
      ${lessonFooter('candles')}`,

    'position-sizing': () => `
      <h1>Position Sizing & The 1% Rule</h1>
      <p class="lead">The #1 reason traders blow up is not bad analysis — it is oversizing. Survival first, profits second.</p>
      <div class="card warn"><div class="card-title">The 1% rule</div>Risk no more than <strong>1% of capital</strong> on any single trade (some pros use 0.5–2%). With 1% risk you can be wrong <em>20 times in a row</em> and still keep 80% of your capital. That is how you stay in the game long enough for your edge to play out.</div>
      <h2>Position size calculator</h2>
      <div id="psize"></div>
      <h2>The math that keeps you alive</h2>
      <table><tr><th>Drawdown</th><th>Gain needed to recover</th></tr>
        <tr><td>−10%</td><td class="pos">+11%</td></tr>
        <tr><td>−25%</td><td class="pos">+33%</td></tr>
        <tr><td>−50%</td><td class="pos">+100%</td></tr>
        <tr><td>−75%</td><td class="neg">+300%</td></tr>
      </table>
      <div class="card note">Losses hurt asymmetrically. A 50% loss needs a 100% gain just to break even. This is the entire argument for stop-losses and small position sizes.</div>
      ${lessonFooter('position-sizing')}`,

    'futures-intro': () => `
      <h1>Futures & Forwards</h1>
      <p class="lead">A futures contract is a standardised promise to buy or sell an asset at a set price on a future date — traded on an exchange, marked to market daily.</p>
      <h2>Forward vs Future</h2>
      <table><tr><th></th><th>Forward</th><th>Future</th></tr>
        <tr><td>Where</td><td>OTC, private</td><td>Exchange</td></tr>
        <tr><td>Terms</td><td>Customised</td><td>Standardised (lot size, expiry)</td></tr>
        <tr><td>Counterparty risk</td><td>Yes</td><td>None (clearing corp)</td></tr>
        <tr><td>Settlement</td><td>At maturity</td><td>Daily mark-to-market</td></tr>
        <tr><td>Liquidity</td><td>Low</td><td>High</td></tr>
      </table>
      <h2>Pricing: cost of carry</h2>
      <div class="card"><code>F = S × e^((r − q)·T)</code><p style="margin-top:8px">The fair futures price = spot grown at the cost of carry: the risk-free rate <code>r</code> (cost of financing) minus any dividend/convenience yield <code>q</code>. For commodities, add storage & insurance costs. Add transportation for delivery-linked contracts.</p></div>
      <div class="card note"><div class="card-title">Law of convergence</div>As expiry approaches, the futures price converges to spot (F → S). Any gap is arbitraged away. This convergence is what makes hedging work — and what creates <strong>basis risk</strong> when it doesn’t close perfectly.</div>
      <h2>Three uses, one contract</h2>
      <div class="grid3">
        <div class="card"><div class="card-title">Hedge</div>Offset a spot position (long stock → short futures).</div>
        <div class="card"><div class="card-title">Speculate</div>Leveraged directional bet — small margin controls a large notional.</div>
        <div class="card"><div class="card-title">Arbitrage</div>Lock the basis when F deviates from fair value.</div>
      </div>
      <h2>Stock index futures</h2>
      <p>Instead of one stock, trade the whole index (NIFTY, SENSEX). Perfect for hedging a diversified portfolio or expressing a macro view — and the foundation of beta hedging (next).</p>
      ${lessonFooter('futures-intro')}`,

    margin: () => `
      <h1>Margin & Mark-to-Market</h1>
      <p class="lead">Futures need no upfront full payment — only a <strong>margin</strong> deposit. But every evening, gains and losses are settled in cash. This is the engine of leverage and the source of margin calls.</p>
      <h2>The mechanics</h2>
      <ul>
        <li><strong>Initial margin</strong> — deposit to open (≈ 10–15% of notional). Your leverage = 1/margin%.</li>
        <li><strong>Maintenance margin</strong> — the floor (≈ 75% of initial). Drop below and you get a <strong>margin call</strong>.</li>
        <li><strong>Mark-to-market</strong> — daily P&L moves real cash in/out of your account at the settlement price.</li>
      </ul>
      <h2>Live margin simulator</h2>
      <p>Open a long futures position and watch 10 days of daily settlement — including margin calls when volatility hits.</p>
      <div id="margin"></div>
      <div class="card warn"><div class="card-title">Leverage cuts both ways</div>At 12% margin you control ~8× your cash. A 2% adverse move = a 16% hit to your deposit. Two bad days can trigger a margin call. Respect the leverage — size positions by the notional, not the margin.</div>
      ${lessonFooter('margin')}`,

    hedging: () => `
      <h1>Hedging with Futures</h1>
      <p class="lead">Hedging swaps an uncertain outcome for a near-certain one. You give up some upside to remove downside. Worked straight from your course notes.</p>
      <h2>Long vs short hedge</h2>
      <div class="grid2">
        <div class="card tip"><div class="card-title">Short hedge</div>You <strong>own</strong> (or will sell) an asset → <strong>short</strong> futures to lock the selling price. Protects against a price fall.</div>
        <div class="card note"><div class="card-title">Long hedge</div>You <strong>will buy</strong> an asset later → <strong>long</strong> futures to lock the buying price. Protects against a price rise.</div>
      </div>
      <h2>Worked example — the Infosys hedge (your notes)</h2>
      <p>You hold 250 Infosys @ ₹2,284 and fear weak results. You short 1 lot of Infosys futures @ ₹2,285. Watch the net P&L stay pinned near <strong>+₹1</strong> regardless of where the stock goes:</p>
      <table><tr><th>Infosys price</th><th>Long spot P&L</th><th>Short futures P&L</th><th>Net</th></tr>
        <tr><td>2200</td><td class="neg">−84</td><td class="pos">+85</td><td class="pos">+1</td></tr>
        <tr><td>2290</td><td class="pos">+6</td><td class="neg">−5</td><td class="pos">+1</td></tr>
        <tr><td>2500</td><td class="pos">+216</td><td class="neg">−215</td><td class="pos">+1</td></tr>
      </table>
      <div class="card">The short future’s gains/losses exactly offset the stock’s — you are <strong>market-neutral</strong>. The cost: you also give up the upside. That is the deal hedging always offers.</div>
      <h2>Hedging a portfolio — beta hedge</h2>
      <p>To hedge a diversified portfolio, scale by its <strong>beta</strong>. Formula from your notes: <code>N = (β_target − β) × V_portfolio / V_futures</code>. Set target beta to 0 for a full hedge, or change it to dial market exposure up/down.</p>
      <div id="betahedge"></div>
      <h2>Optimal hedge ratio (cross hedging)</h2>
      <p>When no future exists on your exact asset, hedge with a correlated one (the airline/jet-fuel example). The minimum-variance hedge ratio is <code>h* = ρ·σ_S/σ_F</code>.</p>
      <div id="opthedge"></div>
      <h2>Basis risk — the catch</h2>
      <div class="card warn"><div class="card-title">Basis = Spot − Futures</div>Hedges are rarely perfect because the basis changes before you close out. In your castor-seed example the basis narrowed from 85 → 80 and left ₹50,000 of slippage. <strong>Hedging trades price risk for basis risk</strong> — much smaller, but not zero. Sources: wrong asset, uncertain timing, early close-out before the delivery month.</div>
      <div class="card tip"><div class="card-title">Why hedge equity at all?</div>From your notes: (1) Stay invested but step out of the market without selling/repurchasing costs. (2) If your stock-picking has alpha, hedging the market leaves you earning <em>risk-free rate + your excess return over the market</em> — pure skill, no market noise.</div>
      ${lessonFooter('hedging')}`,

    'options-intro': () => `
      <h1>Options Basics</h1>
      <p class="lead">An option is the <strong>right, not the obligation</strong>, to buy (call) or sell (put) at a fixed strike before expiry. The buyer pays a premium; the seller (writer) collects it and takes on the obligation.</p>
      <h2>The four positions</h2>
      <div class="grid2">
        <div class="card tip"><div class="card-title">Long Call</div>Right to BUY. Bullish. Risk = premium, reward = unlimited.</div>
        <div class="card warn"><div class="card-title">Short Call</div>Obligation to SELL. Bearish/neutral. Reward = premium, risk = unlimited.</div>
        <div class="card tip"><div class="card-title">Long Put</div>Right to SELL. Bearish. Risk = premium, reward = large (to zero).</div>
        <div class="card warn"><div class="card-title">Short Put</div>Obligation to BUY. Bullish/neutral. Reward = premium, risk = large.</div>
      </div>
      <h2>See every payoff live</h2>
      <p>This is the same Strategy Lab used everywhere in the app. Start with a Long Call, then explore. The blue line is payoff at expiry, the amber dashed line is value <em>today</em>.</p>
      <div id="introlab"></div>
      <h2>Moneyness & the two values</h2>
      <table><tr><th>Term</th><th>Call</th><th>Put</th></tr>
        <tr><td>In-the-money (ITM)</td><td>Spot &gt; Strike</td><td>Spot &lt; Strike</td></tr>
        <tr><td>At-the-money (ATM)</td><td>Spot ≈ Strike</td><td>Spot ≈ Strike</td></tr>
        <tr><td>Out-of-the-money (OTM)</td><td>Spot &lt; Strike</td><td>Spot &gt; Strike</td></tr>
      </table>
      <div class="card note"><strong>Premium = Intrinsic value + Time value.</strong> Intrinsic = what you'd get exercising now. Time value = the rest, paid for the <em>possibility</em> of further moves. Time value decays to zero at expiry (theta) — the central fact of option trading.</div>
      <div class="card warn"><div class="card-title">Futures vs Options — the key difference</div>A future is a <em>symmetric</em> obligation (gain and loss both unlimited). An option is <em>asymmetric</em>: the buyer’s loss is capped at the premium. That asymmetry — paid for via time decay — is what you buy and sell in options.</div>
      ${lessonFooter('options-intro')}`,

    greeks: () => `
      <h1>Option Pricing & The Greeks</h1>
      <p class="lead">Two questions: what is an option <em>worth</em>, and what makes its price <em>move</em>? Black-Scholes-Merton answers the first; the Greeks answer the second.</p>
      <h2>The Black-Scholes-Merton lab</h2>
      <p>Price calls & puts live, see all the Greeks, verify put-call parity, and watch how time value melts into intrinsic value.</p>
      <div id="bsmlab"></div>
      <h2>The Greeks — your dashboard</h2>
      <div class="grid2">
        <div class="card"><div class="card-title">Δ Delta</div>Price change per ₹1 in the underlying. Also ≈ probability of finishing ITM, and your "share-equivalent" exposure. Calls 0→1, puts −1→0.</div>
        <div class="card"><div class="card-title">Γ Gamma</div>How fast delta changes. Highest ATM near expiry — this is the "acceleration" that makes short-gamma positions dangerous.</div>
        <div class="card warn"><div class="card-title">Θ Theta</div>Daily time decay. Negative for buyers (you bleed), positive for sellers (you earn). Accelerates in the final weeks.</div>
        <div class="card"><div class="card-title">Vega</div>Sensitivity to implied volatility. Long options are long vega — you profit when IV rises. The reason to buy options when IV is low.</div>
      </div>
      <div class="card note"><div class="card-title">The binomial model</div>Black-Scholes is the continuous limit of a binomial tree: at each step price moves up by <code>u</code> or down by <code>d</code>, valued with risk-neutral probability <code>p = (e^(rΔt) − d)/(u − d)</code>. Trees also price <strong>American</strong> options (early exercise), which BSM cannot. Both converge to the same number as steps → ∞.</div>
      <div class="card tip"><div class="card-title">Trading takeaway</div><strong>Buy options when IV is low</strong> (cheap vega, you want a move) and <strong>sell when IV is high</strong> (rich premium, theta works for you). Most retail losses come from buying expensive options before earnings and getting crushed by falling IV even when right on direction.</div>
      ${lessonFooter('greeks')}`,

    strategies: (sub) => {
      if (sub) return strategyDetail(sub);
      const filters = [['all', 'All'], ['bull', 'Bullish'], ['bear', 'Bearish'], ['neutral', 'Neutral'], ['vol', 'Volatility'], ['income', 'Income']];
      return `
      <h1>Strategy Lab</h1>
      <p class="lead">All 24 strategies — every one from your course notes plus the modern income trades professionals actually run. Each has a live payoff explorer, the exact market conditions to use it, and the candlestick setups that trigger it. Click any card.</p>
      <div class="filter-bar" id="stratFilter">${filters.map((f, i) => `<span class="fbtn ${i === 0 ? 'active' : ''}" data-f="${f[0]}">${f[1]}</span>`).join('')}</div>
      <div class="strat-grid" id="stratGrid"></div>`;
    },

    wizard: () => `
      <h1>Strategy Selector</h1>
      <p class="lead">Answer three questions about your view, the volatility regime, and your risk appetite — get the strategies that fit. This is the decision process a professional runs before every trade.</p>
      <div id="wizard"></div>
      <div class="card tip" style="margin-top:14px"><div class="card-title">The professional's decision tree</div>1️⃣ <strong>Direction</strong> — bull, bear, neutral, or "big move"? 2️⃣ <strong>Volatility</strong> — is IV cheap (buy) or rich (sell)? 3️⃣ <strong>Defined or open risk</strong>? These three pick the structure. Then the chart picks the strikes and timing.</div>`,

    playbook: () => `
      <h1>The Real-World Playbook</h1>
      <p class="lead">This is where it all connects: read the chart, gauge volatility, pick the strategy. A field manual you can act on.</p>
      <h2>Decision matrix — view × volatility</h2>
      <table>
        <tr><th>Your view ↓ / IV →</th><th>Low IV (buy premium)</th><th>High IV (sell premium)</th></tr>
        <tr><td><span class="pill bull">Bullish</span></td><td>Long Call · Bull Call Spread</td><td>Short Put · Bull Put Spread</td></tr>
        <tr><td><span class="pill bear">Bearish</span></td><td>Long Put · Bear Put Spread</td><td>Bear Call Spread</td></tr>
        <tr><td><span class="pill neutral">Neutral / range</span></td><td>Long Butterfly · Calendar</td><td>Iron Condor · Short Strangle</td></tr>
        <tr><td><span class="pill vol">Big move coming</span></td><td>Long Straddle · Long Strangle</td><td>Short Butterfly · Short Condor</td></tr>
        <tr><td><span class="pill income">Own stock</span></td><td>Protective Put · Collar</td><td>Covered Call</td></tr>
      </table>
      <h2>Candlestick → strategy quick reference</h2>
      <table>
        <tr><th>You see…</th><th>at…</th><th>Run…</th></tr>
        <tr><td>Hammer / Bullish engulfing / Morning star</td><td>Support</td><td>Bull put spread (high IV) or long call (low IV)</td></tr>
        <tr><td>Shooting star / Bearish engulfing / Evening star</td><td>Resistance</td><td>Bear call spread (high IV) or long put (low IV)</td></tr>
        <tr><td>Inside bars / Bollinger squeeze / NR7</td><td>Mid-range, pre-event</td><td>Long straddle / strangle (cheap IV)</td></tr>
        <tr><td>Doji cluster / small bodies</td><td>Established range</td><td>Iron condor / short strangle</td></tr>
        <tr><td>Breakout marubozu</td><td>Above resistance</td><td>Bull call spread on the first pullback</td></tr>
        <tr><td>Distribution at highs</td><td>You own the stock</td><td>Covered call or collar</td></tr>
      </table>
      <h2>The professional pre-trade checklist</h2>
      <div class="card">
        <p>✅ <strong>Thesis</strong> — direction <em>and</em> a price target/level, written down.</p>
        <p>✅ <strong>IV check</strong> — IV rank/percentile decides buy vs sell premium.</p>
        <p>✅ <strong>Structure</strong> — pick from the matrix above; prefer defined-risk spreads.</p>
        <p>✅ <strong>Strikes & expiry</strong> — chart levels set strikes; 30–45 DTE is the sweet spot.</p>
        <p>✅ <strong>Position size</strong> — risk ≤ 1% of capital (see Position Sizing).</p>
        <p>✅ <strong>Exit plan</strong> — profit target (often 50%) and stop, decided <em>before</em> entry.</p>
        <p>✅ <strong>Event calendar</strong> — know every earnings/macro date inside your trade window.</p>
      </div>
      <h2>Worked scenario</h2>
      <div class="card tip">
        <p><strong>Setup:</strong> RELIANCE has rallied 12% into a known resistance at ₹2,950. Today prints a <strong>shooting star</strong>. IV rank is 65 (high). You are mildly bearish but won't bet the farm.</p>
        <p><strong>Read:</strong> Rally rejected at resistance + high IV → <em>sell premium above the rejection</em>.</p>
        <p><strong>Trade:</strong> Bear call spread — sell the ₹3,000 call, buy the ₹3,100 call, 30 DTE, for a net credit. Max loss is the width minus credit; you win if RELIANCE stays below ₹3,000.</p>
        <p><strong>Manage:</strong> Close at 50% of credit, or exit if price closes above ₹3,000 with momentum (thesis dead).</p>
      </div>
      ${lessonFooter('playbook')}`,

    'risk-rules': () => `
      <h1>Risk Management Rules</h1>
      <p class="lead">Strategy gets you in; risk management keeps you alive. These are non-negotiable.</p>
      <div class="card warn"><div class="card-title">1. Size every position by risk, not by conviction</div>≤1% of capital at risk per trade. Conviction is a feeling; ruin is permanent.</div>
      <div class="card warn"><div class="card-title">2. Prefer defined-risk structures</div>Spreads over naked options. The few % of extra cost buys you a known worst case. Naked short options are how accounts go to zero on one gap.</div>
      <div class="card warn"><div class="card-title">3. Decide the exit before you enter</div>Profit target (commonly 50% of max for credit trades) and a stop. No improvising mid-trade.</div>
      <div class="card warn"><div class="card-title">4. Respect implied volatility</div>Don't buy options into high IV (earnings) or sell into low IV. IV rank is your guide.</div>
      <div class="card warn"><div class="card-title">5. Mind theta & expiry</div>Manage trades at ~21 DTE; gamma risk explodes in the final week. Don't hold short options into expiry hoping.</div>
      <div class="card warn"><div class="card-title">6. Diversify the bets, correlate the risk</div>Ten bullish trades in one sector is one big trade. Know your net delta and net vega across the book.</div>
      <div class="card warn"><div class="card-title">7. Keep a trading journal</div>Log thesis, entry, exit, and the lesson. Your edge comes from reviewing your own mistakes, not from tips.</div>
      <h2>The three risks of a futures hedge (your notes)</h2>
      <table><tr><th>Risk</th><th>What it is</th><th>Mitigation</th></tr>
        <tr><td>Basis risk</td><td>Spot−futures gap changes before close-out</td><td>Pick the nearest expiry past your horizon</td></tr>
        <tr><td>Cross-hedge risk</td><td>Hedging instrument ≠ your asset</td><td>Choose the most-correlated contract (high ρ)</td></tr>
        <tr><td>Timing risk</td><td>Uncertain buy/sell date</td><td>Roll the hedge; match contract month</td></tr>
      </table>
      ${lessonFooter('risk-rules')}`,

    quiz: () => `
      <h1>Test Yourself</h1>
      <p class="lead">12 questions spanning hedging math, the Greeks, parity, and strategy selection — drawn straight from the material. Click an answer to see the explanation.</p>
      <div id="quiz"></div>
      ${lessonFooter('quiz')}`,
  };

  // ---------- strategy detail page ----------
  function strategyDetail(id) {
    const s = STRATEGIES.find(x => x.id === id);
    if (!s) return PAGES.strategies();
    const pills = `<span class="pill ${VIEW_LABELS[s.view][0]}">${VIEW_LABELS[s.view][1]}</span>
      <span class="pill ${s.iv === 'high' ? 'income' : s.iv === 'low' ? 'vol' : 'gray'}">${IV_LABELS[s.iv]}</span>`;
    return `
      <span class="back-link" onclick="App.go('strategies')">← All strategies</span>
      <h1>${s.name}</h1>
      <p style="margin-bottom:6px">${pills}</p>
      <p class="lead">${s.tagline}</p>
      <div class="stat-row">
        <div class="stat"><div class="k">Max risk</div><div class="v ${/Unlimited|Substantial/.test(s.risk) ? 'neg' : ''}">${s.risk}</div></div>
        <div class="stat"><div class="k">Max reward</div><div class="v ${/Unlimited|Substantial|High/.test(s.reward) ? 'pos' : ''}">${s.reward}</div></div>
      </div>
      <p>${s.desc}</p>
      <h2>Interactive payoff</h2>
      <div id="stratLab"></div>
      <div class="grid2">
        <div class="card tip"><div class="card-title">✅ When to use it</div><ul>${s.when.map(w => `<li>${w}</li>`).join('')}</ul></div>
        <div class="card note"><div class="card-title">🕯️ Candlestick triggers</div><ul>${s.candles.map(c => `<li>${c}</li>`).join('')}</ul></div>
      </div>
      <div class="card"><div class="card-title">⚙️ How to manage the trade</div><ul>${s.manage.map(m => `<li>${m}</li>`).join('')}</ul></div>
      <div class="card warn"><div class="card-title">💡 Pro tip</div>${s.tips.join(' ')}</div>`;
  }

  // ---------- mounting interactive widgets per page ----------
  function mountWidgets(id, sub) {
    if (id === 'tvm') UI.tvmCalc(U('tvm'));
    if (id === 'candles') UI.candleExplorer(U('candles'));
    if (id === 'position-sizing') UI.positionSize(U('psize'));
    if (id === 'margin') UI.marginSim(U('margin'));
    if (id === 'hedging') { UI.betaHedge(U('betahedge')); UI.optimalHedge(U('opthedge')); }
    if (id === 'options-intro') UI.strategyLab(U('introlab'), STRATEGIES[0]);
    if (id === 'greeks') UI.bsmLab(U('bsmlab'));
    if (id === 'wizard') UI.wizard(U('wizard'));
    if (id === 'quiz') UI.quiz(U('quiz'));
    if (id === 'strategies' && sub) UI.strategyLab(U('stratLab'), STRATEGIES.find(x => x.id === sub));
    if (id === 'strategies' && !sub) mountStratGrid();
  }
  const U = (gid) => document.getElementById(gid);

  function mountStratGrid() {
    const grid = U('stratGrid'), filter = U('stratFilter');
    const render = (f) => {
      const list = f === 'all' ? STRATEGIES : STRATEGIES.filter(s => s.view === f);
      grid.innerHTML = list.map(s => `
        <div class="strat-card" onclick="App.go('strategies','${s.id}')">
          <h4>${s.name}</h4>
          <div style="margin:4px 0 8px"><span class="pill ${VIEW_LABELS[s.view][0]}">${VIEW_LABELS[s.view][1]}</span></div>
          <div class="mini">${s.tagline}</div>
          <div class="mini" style="margin-top:8px;color:var(--muted)">Risk: ${s.risk} · Reward: ${s.reward}</div>
        </div>`).join('');
    };
    filter.querySelectorAll('.fbtn').forEach(b => b.addEventListener('click', () => {
      filter.querySelectorAll('.fbtn').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); render(b.dataset.f);
    }));
    render('all');
  }

  // ---------- router ----------
  function go(id, sub) {
    const page = PAGES[id];
    if (!page) return;
    main.innerHTML = page(sub) + `<div class="page-credit">Made with ❤️ by Aryam</div>`;
    main.scrollTop = 0; window.scrollTo(0, 0);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.id === id));
    mount(() => mountWidgets(id, sub));
    location.hash = sub ? `${id}/${sub}` : id;
  }

  function markDone(id) {
    if (!done.includes(id)) { done.push(id); localStorage.setItem(PROGRESS_KEY, JSON.stringify(done)); toast('Lesson complete! 🎉'); }
    updateProgress(); go(id);
  }

  function updateProgress() {
    const lessons = NAV.flatMap(g => g.items).map(i => i.id).filter(id => !['home', 'strategies', 'wizard'].includes(id));
    const pct = Math.round(done.filter(d => lessons.includes(d)).length / lessons.length * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
    document.querySelectorAll('.nav-item').forEach(n => {
      const d = n.querySelector('.done'); if (d) d.remove();
      if (done.includes(n.dataset.id)) n.insertAdjacentHTML('beforeend', '<span class="done">✓</span>');
    });
  }

  let toastT;
  function toast(msg) {
    const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ---------- build nav ----------
  function buildNav() {
    navEl.innerHTML = NAV.map(g => `
      <div class="nav-group">${g.group}</div>
      ${g.items.map(it => `<a class="nav-item" data-id="${it.id}"><span class="ico">${it.ico === '�split' ? '🎚️' : it.ico}</span>${it.label}</a>`).join('')}
    `).join('');
    navEl.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => { go(n.dataset.id); closeSidebar(); }));
  }

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const navToggle = document.getElementById('navToggle');

  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('open'); }
  function toggleSidebar() { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); }

  navToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', closeSidebar);

  function init() {
    buildNav();
    updateProgress();
    const [id, sub] = (location.hash.replace('#', '').split('/'));
    go(PAGES[id] ? id : 'home', sub);
  }

  return { go, markDone, init };
})();

document.addEventListener('DOMContentLoaded', App.init);
