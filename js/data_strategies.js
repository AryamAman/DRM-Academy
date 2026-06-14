/* data_strategies.js — full strategy catalog (from course notes ch.8 + real-trading practice)
   Each build(S, P) returns legs; P(kind, K) prices an option with current lab inputs. */

const STRATEGIES = [
  {
    id: 'long-call', name: 'Long Call', view: 'bull', iv: 'low', risk: 'Limited', reward: 'Unlimited',
    tagline: 'Simplest bullish bet. Risk limited to premium, unlimited upside.',
    build: (S, P) => [{ kind: 'call', pos: 1, K: rnd(S), prem: P('call', rnd(S)) }],
    desc: 'You buy a call. Downside risk is capped at the premium paid; the position gains more and more quickly as the stock/index rises. The most common first options trade — but in real trading, the timing matters more than the direction because theta (time decay) works against you every day.',
    when: ['Strongly bullish view with a clear catalyst (breakout, earnings momentum, sector tailwind)', 'Implied volatility is LOW (you are buying optionality — buy it cheap)', 'You want defined risk instead of buying the stock or future'],
    candles: ['Bullish engulfing at support', 'Morning star after a downtrend', 'Breakout candle closing above resistance with volume'],
    manage: ['Pick 30–45 days to expiry; exit/roll at ~50% profit or when 2 weeks remain (theta accelerates)', 'Use ATM or slightly ITM (delta .55–.70) for direction; OTM only for lottery-sized bets', 'Hard stop: exit if premium loses 50% — do not "hope" with a decaying asset'],
    tips: ['Never buy calls right before earnings just because you are bullish — IV crush after the event can wipe out gains even if you are right on direction.']
  },
  {
    id: 'short-call', name: 'Short (Naked) Call', view: 'bear', iv: 'high', risk: 'Unlimited', reward: 'Limited',
    tagline: 'Aggressive bearish income trade. Unlimited risk — for experienced traders only.',
    build: (S, P) => [{ kind: 'call', pos: -1, K: rnd(S * 1.03), prem: P('call', rnd(S * 1.03)) }],
    desc: 'You sell a call without owning the stock ("naked"). You keep the premium if price stays below the strike. Losses grow without limit if price rallies — this is the strategy that blows up accounts when a stock gaps up.',
    when: ['Strong conviction price will NOT rise (resistance overhead, weak market breadth)', 'Implied volatility is HIGH and likely to fall (you sell expensive premium)', 'You can post margin and tolerate unlimited-risk exposure'],
    candles: ['Shooting star / gravestone doji at resistance', 'Bearish engulfing after extended rally', 'Lower highs forming under a supply zone'],
    manage: ['Sell strikes beyond strong resistance, delta ≤ .30', 'Buy back at 50% of premium collected — do not hold for the last few rupees', 'Stop loss at 2× premium received; never sell naked calls through earnings'],
    tips: ['Most pros convert this to a bear call spread (buy a higher strike) — same view, defined risk, far smaller margin.']
  },
  {
    id: 'long-put', name: 'Long Put', view: 'bear', iv: 'low', risk: 'Limited', reward: 'Substantial (to zero)',
    tagline: 'Defined-risk bearish bet or portfolio insurance.',
    build: (S, P) => [{ kind: 'put', pos: 1, K: rnd(S), prem: P('put', rnd(S)) }],
    desc: 'You buy a put. If the underlying falls below the strike you profit up to (strike − 0); if it rises you lose only the premium. Also the cleanest hedge for a long portfolio in a falling market.',
    when: ['Bearish view with momentum (breakdown below support)', 'IV is low — puts get very expensive once fear arrives, so buy before the panic', 'Hedging: protect stock gains through an event without selling'],
    candles: ['Bearish engulfing at resistance', 'Evening star after an uptrend', 'Breakdown candle closing below support with volume'],
    manage: ['30–45 DTE, delta −.50 to −.70 for directional trades', 'Take profit at 50–100%; markets fall fast — puts hit targets quicker than calls', 'Exit if the breakdown level is reclaimed (your thesis is invalidated)'],
    tips: ['Buying index puts when VIX is depressed is the cheapest portfolio insurance you will ever get.']
  },
  {
    id: 'short-put', name: 'Short Put (Cash-Secured)', view: 'bull', iv: 'high', risk: 'Substantial (to zero)', reward: 'Limited (premium)',
    tagline: 'Get paid to promise to buy a stock you want, at a lower price.',
    build: (S, P) => [{ kind: 'put', pos: -1, K: rnd(S * 0.97), prem: P('put', rnd(S * 0.97)) }],
    desc: 'You sell a put. If price stays above the strike, you keep the premium. If it falls below, you effectively buy the stock at strike − premium. Maximum loss is large (stock to zero) but identical to owning the stock from the strike.',
    when: ['Neutral-to-bullish on a quality stock you would genuinely buy at the strike', 'IV is high (post-selloff fear inflates put premiums — that is when this pays best)', 'Income generation with cash reserved as collateral'],
    candles: ['Hammer / pin bar at major support', 'Bullish engulfing after a panic flush', 'Higher lows forming above a demand zone'],
    manage: ['Sell 25–30 delta puts, 30–45 DTE, at strikes = support levels', 'Close at 50% of max profit; roll down-and-out if the strike is breached', 'Only sell puts on stocks you would hold — assignment is a feature, not a bug'],
    tips: ['The "wheel": sell cash-secured puts → if assigned, sell covered calls on the shares → repeat. A complete income system.']
  },
  {
    id: 'covered-call', name: 'Covered Call', view: 'income', iv: 'high', risk: 'Stock downside (cushioned)', reward: 'Limited',
    tagline: 'Own the stock, rent it out. The classic income strategy from your notes.',
    build: (S, P) => [{ kind: 'stock', pos: 1, entry: S }, { kind: 'call', pos: -1, K: rnd(S * 1.04), prem: P('call', rnd(S * 1.04)) }],
    desc: 'You own shares and sell an OTM call against them. If the stock stays below the strike, the call expires and the premium is your income. If it rallies above, your shares get called away at the strike — you still profit, just capped. Adopted when you are neutral to moderately bullish (per your course notes).',
    when: ['You hold a stock you expect to rise slowly or stay flat near-term', 'IV is elevated — richer call premiums = better rent', 'You want yield from a long-term holding without selling it'],
    candles: ['Stock consolidating in a range after a rally (inside bars, small bodies)', 'Doji / spinning tops near resistance — momentum stalling', 'Avoid right after a strong breakout candle — you will cap a big move'],
    manage: ['Sell 30–45 DTE calls at delta .25–.35, above resistance', 'If stock surges through strike: roll up and out, or let shares go and re-enter', 'If stock drops: the premium cushions the loss; keep selling calls lower (but never below your cost without a plan)'],
    tips: ['Monthly covered calls on an index ETF or quality large-cap can add 8–15% annualized yield. This is how many professionals generate income on core holdings.']
  },
  {
    id: 'protective-put', name: 'Protective Put / Synthetic Long Call', view: 'bull', iv: 'low', risk: 'Limited', reward: 'Unlimited',
    tagline: 'Buy stock + buy put = insured stock. Pay-off mirrors a long call.',
    build: (S, P) => [{ kind: 'stock', pos: 1, entry: S }, { kind: 'put', pos: 1, K: rnd(S * 0.975), prem: P('put', rnd(S * 0.975)) }],
    desc: 'From your notes: buy the stock for the long-term benefits (price rise, dividends, bonus, rights) and buy a slightly OTM put as insurance against an adverse move. Loss is capped at (entry − strike + premium); profit stays unlimited. The payoff resembles a long call, hence "synthetic long call".',
    when: ['Buying a stock for medium/long term but a risk event is near (results, elections, Fed/RBI policy)', 'You already hold large unrealized gains and want to lock a floor', 'IV reasonable — insurance is affordable'],
    candles: ['Buying a breakout but the prior trend was volatile (wide-range candles)', 'Entering after a V-shaped recovery that could retest lows'],
    manage: ['Put strike 2–5% below entry, expiry past the risk event', 'After the event passes safely, sell the remaining put value or let it run as trailing protection', 'Renew quarterly only if the protection thesis still holds — insurance drag compounds'],
    tips: ['Cost-conscious version: pay for the put by selling an OTM call → that is the Collar (next strategy).']
  },
  {
    id: 'collar', name: 'Collar', view: 'income', iv: 'any', risk: 'Limited', reward: 'Limited',
    tagline: 'Covered call + protective put. Low-risk, conservatively bullish.',
    build: (S, P) => [
      { kind: 'stock', pos: 1, entry: S },
      { kind: 'put', pos: 1, K: rnd(S * 0.97), prem: P('put', rnd(S * 0.97)) },
      { kind: 'call', pos: -1, K: rnd(S * 1.05), prem: P('call', rnd(S * 1.05)) }
    ],
    desc: 'Buy stock, buy an ATM/OTM put for downside insurance, and finance it by selling an OTM call. Both profit and loss are boxed in. Per your notes: a low-risk strategy for the conservatively bullish — often the put cost is fully offset by the call ("zero-cost collar").',
    when: ['Protecting a concentrated position (ESOPs, inherited stock) through uncertainty', 'You must stay invested (tax reasons) but cannot afford a drawdown', 'Pre-earnings on a big holding'],
    candles: ['Distribution signs at highs: long upper wicks, churning volume', 'You are still in an uptrend but candles are narrowing (fading momentum)'],
    manage: ['Classic setup: put ~3% below, call ~5% above, same expiry, equal quantity', 'Aim for net-zero cost; if calls are rich (high IV) you can even collect a credit', 'At expiry, re-strike the collar around the new price'],
    tips: ['A zero-cost collar converted ₹0 of insurance cost into a guaranteed price band — institutions use exactly this on promoter stakes.']
  },
  {
    id: 'long-combo', name: 'Long Combo (Synthetic Future)', view: 'bull', iv: 'any', risk: 'Substantial', reward: 'Unlimited',
    tagline: 'Sell OTM put + buy OTM call ≈ long stock at a fraction of the cost.',
    build: (S, P) => [
      { kind: 'put', pos: -1, K: rnd(S * 0.95), prem: P('put', rnd(S * 0.95)) },
      { kind: 'call', pos: 1, K: rnd(S * 1.05), prem: P('call', rnd(S * 1.05)) }
    ],
    desc: 'From your notes: bullish strategy that simulates owning the stock for a tiny net debit (or credit). The short put pays for the long call. Between the strikes you make/lose nothing at expiry; beyond them it behaves like stock. Returns can be very high for the small investment — but losses below the put strike are stock-like too.',
    when: ['Strongly bullish but capital-constrained', 'Stock in a clean uptrend with well-defined support (put strike goes below it)', 'Margin available for the short put'],
    candles: ['Flag/pennant breakout in an established uptrend', 'Higher-low structure: place short put under the latest higher low'],
    manage: ['Strikes outside the recent range: put below support, call above resistance', 'Treat it like a leveraged stock position — size by the put-side risk, not the debit', 'Exit both legs if support breaks'],
    tips: ['This is how pros build cheap bullish exposure without buying futures — but the margin and tail risk are real. Size small.']
  },
  {
    id: 'protective-call', name: 'Protective Call / Synthetic Long Put', view: 'bear', iv: 'any', risk: 'Limited', reward: 'Substantial',
    tagline: 'Short stock + long call = bearish with a capped upside loss.',
    build: (S, P) => [{ kind: 'stock', pos: -1, entry: S }, { kind: 'call', pos: 1, K: rnd(S * 1.01), prem: P('call', rnd(S * 1.01)) }],
    desc: 'From your notes: you short the stock and buy an ATM/slightly-OTM call to hedge. Net effect is a long-put-like payoff but built for a net credit (you receive money shorting the stock). Gains on the fall, capped loss on an unexpected rise.',
    when: ['Bearish on a stock but it is prone to violent short-covering rallies', 'Shorting into an event where a gap-up would be fatal to a naked short'],
    candles: ['Lower highs into resistance, distribution volume', 'Breakdown retest failing (price rejected at prior support-turned-resistance)'],
    manage: ['Call strike just above your short entry caps the squeeze risk precisely', 'Cover the short at support; the call may still have salvage value', 'In India, stock shorts must be intraday or via futures — this is usually built with short futures + long call'],
    tips: ['Short futures + long ATM call is the practical Indian version — fully margined, no borrow needed.']
  },
  {
    id: 'covered-put', name: 'Covered Put', view: 'bear', iv: 'high', risk: 'Unlimited (upside)', reward: 'Limited',
    tagline: 'Short stock + short put. Neutral-to-bearish income.',
    build: (S, P) => [{ kind: 'stock', pos: -1, entry: S }, { kind: 'put', pos: -1, K: rnd(S * 0.96), prem: P('put', rnd(S * 0.96)) }],
    desc: 'Opposite of a covered call (per your notes): short the stock and sell an OTM put. If price stays flat or drifts down you keep the premium as income in a neutral market. Risk: unlimited on a rally — the short stock is unprotected above.',
    when: ['Range-bound to mildly falling stock', 'High IV puts to sell', 'You are comfortable managing a short position'],
    candles: ['Rounded top / lower highs with a flat floor (range)', 'Repeated rejections at a falling moving average'],
    manage: ['Put strike at the range floor — that is where you are happy to cover', 'Buy back the put at 50%; keep a hard stop on the stock leg above resistance', 'Retail traders should prefer a bear call spread — same view, capped risk'],
    tips: ['This strategy has the same risk profile as a naked call. Most professionals skip it in favor of defined-risk spreads.']
  },
  {
    id: 'bull-call-spread', name: 'Bull Call Spread', view: 'bull', iv: 'any', risk: 'Limited', reward: 'Limited',
    tagline: 'Buy ITM call, sell OTM call. Cheaper bullish bet, lower breakeven.',
    build: (S, P) => [
      { kind: 'call', pos: 1, K: rnd(S * 0.98), prem: P('call', rnd(S * 0.98)) },
      { kind: 'call', pos: -1, K: rnd(S * 1.04), prem: P('call', rnd(S * 1.04)) }
    ],
    desc: 'From your notes: buy a lower-strike (ITM/ATM) call and sell a higher-strike (OTM) call, same expiry. The sold call brings down the cost, the breakeven, and the max loss versus a naked long call — in exchange for capped gains. The workhorse strategy for "moderately bullish".',
    when: ['Moderately bullish — you have a price target (set short strike there)', 'IV is high enough that naked calls are expensive (the short leg offsets it)', 'Defined risk/reward with good probability'],
    candles: ['Bounce off support with bullish engulfing — target = next resistance', 'Uptrend pullback to 20/50-day MA holding (buy the dip with definition)'],
    manage: ['Risk:reward ≥ 1:1.5 — pay ⅓ to ½ of the spread width max', 'Take profit at 60–75% of max value; gamma near expiry makes the last 25% slow and risky', 'If wrong, exit at 50% of debit lost — never let a spread go to zero'],
    tips: ['Spreads neutralize IV and theta substantially — this is why pros trade spreads, not naked options, for directional views.']
  },
  {
    id: 'bull-put-spread', name: 'Bull Put Spread (Credit)', view: 'bull', iv: 'high', risk: 'Limited', reward: 'Limited (credit)',
    tagline: 'Sell put spread below support. Profit if stock simply does NOT fall.',
    build: (S, P) => [
      { kind: 'put', pos: -1, K: rnd(S * 0.97), prem: P('put', rnd(S * 0.97)) },
      { kind: 'put', pos: 1, K: rnd(S * 0.92), prem: P('put', rnd(S * 0.92)) }
    ],
    desc: 'Sell a put near support, buy a further-OTM put as protection, collect a net credit. You win if price rises, stays flat, or even falls slightly — you only need price to stay above the short strike. High-probability income with strictly defined risk.',
    when: ['Neutral-to-bullish; strong support below current price', 'IV is HIGH (sell expensive premium, defined risk)', 'Theta-positive income: you profit from time passing'],
    candles: ['Hammer at support → sell the spread under the hammer low', 'Higher lows + flat resistance (ascending triangle): sell puts under the rising trendline'],
    manage: ['Short strike at 25–30 delta, below support; width per your risk budget', 'Close at 50% of credit; manage at 21 DTE regardless', 'If breached: roll the spread down-and-out for a credit, or take the defined loss'],
    tips: ['Credit put spreads under support on strong stocks in high-IV regimes are arguably the highest win-rate retail strategy. The catch: occasional max losses — position size is everything.']
  },
  {
    id: 'bear-call-spread', name: 'Bear Call Spread (Credit)', view: 'bear', iv: 'high', risk: 'Limited', reward: 'Limited (credit)',
    tagline: 'Sell call spread above resistance. Profit if stock does NOT rally.',
    build: (S, P) => [
      { kind: 'call', pos: -1, K: rnd(S * 1.03), prem: P('call', rnd(S * 1.03)) },
      { kind: 'call', pos: 1, K: rnd(S * 1.08), prem: P('call', rnd(S * 1.08)) }
    ],
    desc: 'From your notes: for a range-bound or falling market, sell a call and protect it by buying a higher-strike call, for a net credit. The defined-risk version of the naked call — the long call "insures the call sold".',
    when: ['Bearish or neutral; clear resistance overhead', 'High IV after a rally (call premiums inflated)', 'You want income with a margin of safety on direction'],
    candles: ['Shooting star / bearish engulfing at resistance → sell spread above that high', 'Failed breakout (price back inside range) — sell above the false-break high'],
    manage: ['Short strike above the rejection high, 25–30 delta', 'Close at 50% of credit or 21 DTE', 'If price closes above your short strike with momentum — exit; do not argue with a breakout'],
    tips: ['Pairs naturally with the bull put spread to form the Iron Condor when you expect a range.']
  },
  {
    id: 'bear-put-spread', name: 'Bear Put Spread', view: 'bear', iv: 'any', risk: 'Limited', reward: 'Limited',
    tagline: 'Buy ATM put, sell lower OTM put. Defined-risk bet on a fall.',
    build: (S, P) => [
      { kind: 'put', pos: 1, K: rnd(S * 1.01), prem: P('put', rnd(S * 1.01)) },
      { kind: 'put', pos: -1, K: rnd(S * 0.95), prem: P('put', rnd(S * 0.95)) }
    ],
    desc: 'Buy a higher-strike put and sell a lower-strike put, same expiry, net debit. The sold put cheapens the trade in exchange for capping profit at the lower strike. Best when you expect a measured decline to a specific level.',
    when: ['Moderately bearish with a downside target (short strike there)', 'Put IV already elevated — the short leg offsets the inflated cost', 'Hedging a portfolio cheaply (put spread collar)'],
    candles: ['Breakdown below support — target the next demand zone', 'Evening star / dark cloud cover at the top of a range'],
    manage: ['Same discipline as bull call spread: pay ≤ half the width', 'Take 60–75% of max profit; declines often V-bounce', 'Exit if price reclaims the breakdown level'],
    tips: ['In falling markets IV rises — debit put spreads suffer less IV drag than naked puts bought into the panic.']
  },
  {
    id: 'long-straddle', name: 'Long Straddle', view: 'vol', iv: 'low', risk: 'Limited (both premiums)', reward: 'Unlimited',
    tagline: 'Buy ATM call + ATM put. Bet on a BIG move, direction unknown.',
    build: (S, P) => [
      { kind: 'call', pos: 1, K: rnd(S), prem: P('call', rnd(S)) },
      { kind: 'put', pos: 1, K: rnd(S), prem: P('put', rnd(S)) }
    ],
    desc: 'From your notes: a volatility strategy — buy a call and a put at the same strike and expiry. A big move either way pays; a quiet market burns both premiums. You are long volatility and short time.',
    when: ['Binary event ahead: earnings, budget, election verdict, court ruling, RBI/Fed decision', 'IV is LOW relative to the move you expect (compare straddle cost vs historical event moves)', 'Chart shows extreme compression about to resolve'],
    candles: ['Tight consolidation / narrowing Bollinger squeeze (tiny candles in a coil)', 'Symmetrical triangle near its apex', 'NR7 (narrowest range in 7 days) at a major level'],
    manage: ['Straddle cost = the market-implied move; you profit only if the real move beats it', 'Take the money on the explosive move — do not wait for expiry', 'If the event passes with no move, exit immediately; IV crush + theta will eat the rest fast'],
    tips: ['Check: if the ATM straddle costs 4% of spot and the stock historically moves 6% on earnings, the bet has edge. If it moves 3%, you are the one selling insurance too cheap — skip it.']
  },
  {
    id: 'short-straddle', name: 'Short Straddle', view: 'neutral', iv: 'high', risk: 'Unlimited', reward: 'Limited (both premiums)',
    tagline: 'Sell ATM call + put. Maximum income if price pins the strike.',
    build: (S, P) => [
      { kind: 'call', pos: -1, K: rnd(S), prem: P('call', rnd(S)) },
      { kind: 'put', pos: -1, K: rnd(S), prem: P('put', rnd(S)) }
    ],
    desc: 'Sell both an ATM call and put. You collect the largest possible premium and win if price stays near the strike. Unlimited risk both ways — the professional version is always managed actively or replaced with an Iron Butterfly.',
    when: ['Post-event IV crush plays (sell INTO inflated IV, after the news drops)', 'Expiry-day index "pinning" strategies', 'Strict risk management infrastructure in place (alerts, stops, adjustment plan)'],
    candles: ['Wide-range event candle followed by inside candles (volatility exhausted)', 'Price oscillating around a heavy open-interest strike near expiry'],
    manage: ['Exit/adjust when price touches a breakeven; never "hope" with naked short gamma', 'Standard pro target: 25–40% of credit, then close', 'Convert to iron butterfly (buy wings) when margin or risk gets uncomfortable'],
    tips: ['Selling straddles on quiet days feels like free money until one trending day returns months of profits. Respect the tail.']
  },
  {
    id: 'long-strangle', name: 'Long Strangle', view: 'vol', iv: 'low', risk: 'Limited', reward: 'Unlimited',
    tagline: 'Cheaper straddle: buy OTM call + OTM put. Needs a bigger move.',
    build: (S, P) => [
      { kind: 'put', pos: 1, K: rnd(S * 0.96), prem: P('put', rnd(S * 0.96)) },
      { kind: 'call', pos: 1, K: rnd(S * 1.04), prem: P('call', rnd(S * 1.04)) }
    ],
    desc: 'From your notes: a cheaper modification of the straddle — buy a slightly OTM put and OTM call, same expiry. Lower cost means potentially higher percentage returns, but the underlying must move further before either option pays.',
    when: ['Same volatility events as the straddle, but you want to risk less per unit', 'Expecting a violent move well beyond the strikes (not just "some" movement)'],
    candles: ['Multi-week coiling range about to resolve', 'Volatility squeeze with volume drying up'],
    manage: ['Both legs OTM by similar deltas (e.g., 25Δ each side)', 'Same exit discipline as straddle: take the spike, never ride IV crush', 'Losing both premiums is the most common outcome — size accordingly (≤1% of capital)'],
    tips: ['Strangles are lottery tickets with better odds when IV rank < 20. Track IV percentile before every volatility purchase.']
  },
  {
    id: 'short-strangle', name: 'Short Strangle', view: 'neutral', iv: 'high', risk: 'Unlimited', reward: 'Limited (credit)',
    tagline: 'Sell OTM call + OTM put. Wider safe zone than short straddle.',
    build: (S, P) => [
      { kind: 'put', pos: -1, K: rnd(S * 0.95), prem: P('put', rnd(S * 0.95)) },
      { kind: 'call', pos: -1, K: rnd(S * 1.05), prem: P('call', rnd(S * 1.05)) }
    ],
    desc: 'From your notes: sell an OTM put and OTM call. Less credit than a short straddle, but the breakevens are much wider — price has to travel further before you lose. The bread-and-butter income trade of professional option sellers (with iron-condor wings added for safety).',
    when: ['Range-bound market, no events on the calendar', 'IV rank > 50 — you are selling fear that statistically deflates', 'Index options preferred (no single-stock gap risk)'],
    candles: ['Established horizontal range with 3+ touches each side — sell beyond both extremes', 'Declining volatility after a trending phase (ADX falling)'],
    manage: ['16–20 delta strikes, 30–45 DTE; manage at 21 DTE or 50% profit', 'Defend the tested side: roll it out/away, or roll the untested side closer for more credit', 'Exit if short strike goes ITM — your range thesis is dead'],
    tips: ['Add long wings (→ Iron Condor) and you can sleep at night. The margin saved usually outweighs the wing cost.']
  },
  {
    id: 'iron-condor', name: 'Iron Condor', view: 'neutral', iv: 'high', risk: 'Limited', reward: 'Limited (credit)',
    tagline: 'Bull put spread + bear call spread. THE defined-risk range trade.',
    build: (S, P) => [
      { kind: 'put', pos: 1, K: rnd(S * 0.91), prem: P('put', rnd(S * 0.91)) },
      { kind: 'put', pos: -1, K: rnd(S * 0.95), prem: P('put', rnd(S * 0.95)) },
      { kind: 'call', pos: -1, K: rnd(S * 1.05), prem: P('call', rnd(S * 1.05)) },
      { kind: 'call', pos: 1, K: rnd(S * 1.09), prem: P('call', rnd(S * 1.09)) }
    ],
    desc: 'Sell an OTM put spread below support and an OTM call spread above resistance. You collect a credit and win if price expires anywhere between the short strikes. Defined max loss = width − credit. The most popular income structure in modern retail and prop trading.',
    when: ['Clear trading range, IV rank elevated, no binary events inside the trade window', 'Weekly/monthly index income programs', 'You want short-strangle economics without tail risk'],
    candles: ['Sideways channel with clear floors and ceilings — strikes go beyond both', 'Post-event drift: big move done, IV still rich, market digesting'],
    manage: ['Collect ≥ ⅓ of wing width as credit; short strikes ~16–20 delta', 'Take 50% of credit; manage at 21 DTE', 'Adjust by rolling the untested side in; exit if a short strike is breached on momentum'],
    tips: ['Monthly iron condors on NIFTY with mechanical 50%-profit exits have been a staple income system — but sizing ≤5% risk per expiry is what keeps you in the game.']
  },
  {
    id: 'long-call-butterfly', name: 'Long Call Butterfly', view: 'neutral', iv: 'any', risk: 'Limited (small debit)', reward: 'High multiple',
    tagline: 'Pin-the-strike trade: tiny cost, big payout if price lands on target.',
    build: (S, P) => [
      { kind: 'call', pos: 1, K: rnd(S * 0.96), prem: P('call', rnd(S * 0.96)) },
      { kind: 'call', pos: -2, K: rnd(S), prem: P('call', rnd(S)), qty: 1 },
      { kind: 'call', pos: 1, K: rnd(S * 1.04), prem: P('call', rnd(S * 1.04)) }
    ],
    desc: 'Buy one lower call, sell two middle calls, buy one higher call (1-2-1, equidistant). Costs a small debit; pays the full wing width if price expires exactly at the middle strike. A precision bet on WHERE price will be, popular for expiry-day index trades.',
    when: ['Strong opinion that price will gravitate to a specific level (max-pain / heavy OI strike)', 'Low-cost neutral trade when IV is high (butterflies get cheaper as IV rises)', 'Expiry-day plays with hours of theta to harvest'],
    candles: ['Price magnetized to a round number with shrinking candles', 'Range narrowing into expiry around a heavy open-interest strike'],
    manage: ['Middle strike = your target; wings = how wrong you can afford to be', 'Profit peaks at expiry only — close at 2–3× debit rather than waiting for perfection', 'Risk is the debit; no adjustment needed, just position size'],
    tips: ['Note the -2 in the middle: the short calls are covered by both wings. Brokers margin this lightly — great risk/reward per rupee of capital.']
  },
  {
    id: 'short-call-butterfly', name: 'Short Call Butterfly', view: 'vol', iv: 'any', risk: 'Limited', reward: 'Limited (credit)',
    tagline: 'Inverse butterfly: profit if price moves AWAY from the middle strike.',
    build: (S, P) => [
      { kind: 'call', pos: -1, K: rnd(S * 0.96), prem: P('call', rnd(S * 0.96)) },
      { kind: 'call', pos: 2, K: rnd(S), prem: P('call', rnd(S)), qty: 1 },
      { kind: 'call', pos: -1, K: rnd(S * 1.04), prem: P('call', rnd(S * 1.04)) }
    ],
    desc: 'Sell the wings, buy 2× the body. Collects a small credit which you keep if price finishes beyond either wing. A defined-risk way to bet on movement when straddles are too expensive.',
    when: ['Expecting a breakout from compression but option premiums are rich', 'Cheap defined-risk volatility bet'],
    candles: ['Coiled spring: triangle apex, squeeze patterns', 'Pre-event compression when you cannot afford a straddle'],
    manage: ['Max loss sits exactly at the middle strike at expiry', 'Exit on the breakout move — convexity is front-loaded', 'Credit is small; commissions matter, use liquid strikes'],
    tips: ['Compare with long strangle: butterfly risks less but also pays less. Pick by IV: high IV → short butterfly, low IV → strangle.']
  },
  {
    id: 'long-call-condor', name: 'Long Call Condor', view: 'neutral', iv: 'any', risk: 'Limited (debit)', reward: 'Limited',
    tagline: 'Butterfly with a flat top: profit zone is a range, not a point.',
    build: (S, P) => [
      { kind: 'call', pos: 1, K: rnd(S * 0.94), prem: P('call', rnd(S * 0.94)) },
      { kind: 'call', pos: -1, K: rnd(S * 0.98), prem: P('call', rnd(S * 0.98)) },
      { kind: 'call', pos: -1, K: rnd(S * 1.02), prem: P('call', rnd(S * 1.02)) },
      { kind: 'call', pos: 1, K: rnd(S * 1.06), prem: P('call', rnd(S * 1.06)) }
    ],
    desc: 'Buy ITM call, sell ITM call, sell OTM call, buy OTM call (4 strikes, all calls). Like a butterfly whose body is stretched into a plateau — max profit anywhere between the two middle strikes. All-debit cousin of the iron condor.',
    when: ['Range-bound view with a wider tolerance than a butterfly', 'Prefer debit structures (no margin) over credit condors'],
    candles: ['Stable range, low momentum (small real bodies, alternating colors)'],
    manage: ['Middle strikes bracket your expected range', 'Take 50–70% of max value; the plateau decays in your favor near expiry', 'Risk = net debit, fixed at entry'],
    tips: ['Same payoff family as the iron condor — choose whichever your broker margins cheaper. Economically they are near-identical.']
  },
  {
    id: 'short-call-condor', name: 'Short Call Condor', view: 'vol', iv: 'any', risk: 'Limited', reward: 'Limited (credit)',
    tagline: 'From your notes: profit when the market "breaks open significantly on any side".',
    build: (S, P) => [
      { kind: 'call', pos: -1, K: rnd(S * 0.94), prem: P('call', rnd(S * 0.94)) },
      { kind: 'call', pos: 1, K: rnd(S * 0.98), prem: P('call', rnd(S * 0.98)) },
      { kind: 'call', pos: 1, K: rnd(S * 1.02), prem: P('call', rnd(S * 1.02)) },
      { kind: 'call', pos: -1, K: rnd(S * 1.06), prem: P('call', rnd(S * 1.06)) }
    ],
    desc: 'Your notes’ example: Nifty at 3600, expecting high volatility — sell ITM 3400 call, buy ITM 3500 call, buy OTM 3700 call, sell OTM 3800 call for a net credit. You keep the credit if the market breaks out strongly in either direction; max loss if it stays between the middle strikes.',
    when: ['Expecting a large move but wanting strictly defined risk', 'Event trades where straddles are overpriced'],
    candles: ['Apex of a long consolidation', 'Pre-budget / pre-results compression'],
    manage: ['Profit zones are beyond the outer strikes — needs a genuine breakout', 'Exit into the breakout; do not hold through a fade back into the body', 'Defined risk both ways; size by max loss at the body'],
    tips: ['Functionally a short butterfly with a wider trough. Compare credits and pick the better-priced structure.']
  }
];

function rnd(x) { // round to a sensible strike interval
  const step = x > 10000 ? 100 : x > 2000 ? 50 : x > 500 ? 10 : 5;
  return Math.round(x / step) * step;
}

const VIEW_LABELS = { bull: ['bull', 'Bullish'], bear: ['bear', 'Bearish'], neutral: ['neutral', 'Neutral / Range'], vol: ['vol', 'Volatility'], income: ['income', 'Income'] };
const IV_LABELS = { low: 'Best when IV is LOW (buy premium)', high: 'Best when IV is HIGH (sell premium)', any: 'Works across IV regimes' };
