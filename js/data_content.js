/* data_content.js — lesson content, candlestick patterns, quiz */

const CANDLE_PATTERNS = [
  {
    id: 'hammer', name: 'Hammer', bias: 'bull',
    candles: [{o:108,h:110,l:104,c:105},{o:105,h:106,l:101,c:102},{o:102,h:103,l:94,c:101.5}],
    signal: 'Small body at the top, long lower wick (≥2× body) after a decline. Sellers pushed price down hard intraday but buyers absorbed everything and closed it back near the top.',
    confirm: 'Next candle closes above the hammer high, ideally at a known support level with volume.',
    strategies: ['short-put', 'bull-put-spread', 'long-call'],
    play: 'At major support: sell a cash-secured put or bull put spread with short strike below the hammer low. Aggressive: buy a call after the confirmation candle.'
  },
  {
    id: 'shooting-star', name: 'Shooting Star', bias: 'bear',
    candles: [{o:94,h:96,l:93,c:95.5},{o:95.5,h:98,l:95,c:97.5},{o:97.5,h:104,l:97,c:98}],
    signal: 'Small body at the bottom, long upper wick after an advance. Buyers drove price up but supply slammed it back down — rally rejected.',
    confirm: 'Next candle closes below the star body, at resistance, ideally with rising volume.',
    strategies: ['bear-call-spread', 'long-put', 'covered-call'],
    play: 'At resistance: sell a bear call spread above the wick high. If you hold the stock, this is the textbook moment to write a covered call.'
  },
  {
    id: 'bullish-engulfing', name: 'Bullish Engulfing', bias: 'bull',
    candles: [{o:104,h:105,l:100,c:101},{o:101,h:102,l:98,c:99},{o:98.5,h:104.5,l:98,c:104}],
    signal: 'A green body completely swallows the prior red body after a downtrend. Demand overwhelmed supply in one session — momentum has flipped.',
    confirm: 'Occurs at support / oversold readings; volume on the engulfing candle exceeds the prior candle.',
    strategies: ['long-call', 'bull-call-spread', 'short-put'],
    play: 'Buy a 30–45 DTE call or bull call spread targeting the next resistance. Income traders: sell a put spread below the engulfing low.'
  },
  {
    id: 'bearish-engulfing', name: 'Bearish Engulfing', bias: 'bear',
    candles: [{o:96,h:99,l:95.5,c:98.5},{o:98.5,h:101,l:98,c:100.5},{o:101,h:101.5,l:96.5,c:97}],
    signal: 'A red body engulfs the prior green body after an uptrend. Distribution day — sellers took control.',
    confirm: 'At resistance or after an extended run; next candle makes a lower low.',
    strategies: ['long-put', 'bear-put-spread', 'bear-call-spread'],
    play: 'Buy a put / bear put spread targeting the nearest support. Or sell a bear call spread above the engulfing high for income.'
  },
  {
    id: 'doji', name: 'Doji (Indecision)', bias: 'neutral',
    candles: [{o:97,h:100,l:96,c:99.5},{o:99.5,h:102,l:99,c:101.5},{o:101.5,h:103.5,l:99.5,c:101.6}],
    signal: 'Open ≈ close: a stalemate. After a trend it warns of exhaustion; inside a range it confirms balance.',
    confirm: 'Meaning depends entirely on location — a doji at fresh highs is a warning, a doji mid-range is noise.',
    strategies: ['iron-condor', 'short-strangle', 'long-call-butterfly'],
    play: 'A series of dojis/small bodies in a range = premium-selling conditions: iron condor or strangle around the range. Single doji after a long trend = tighten stops, consider collars on holdings.'
  },
  {
    id: 'morning-star', name: 'Morning Star', bias: 'bull',
    candles: [{o:106,h:107,l:99,c:100},{o:99.5,h:100.5,l:97.5,c:98.5},{o:99,h:106,l:98.8,c:105}],
    signal: 'Three candles: big red → small indecision gap-down → big green closing into the first candle’s body. A complete sentiment reversal arc.',
    confirm: 'Third candle closes above the midpoint of the first; strongest at major support.',
    strategies: ['long-call', 'bull-call-spread', 'long-combo'],
    play: 'One of the highest-reliability bottoming patterns. Buy calls/call spreads; conviction entries can use a long combo (sell put below the star low, buy call above).'
  },
  {
    id: 'evening-star', name: 'Evening Star', bias: 'bear',
    candles: [{o:94,h:101,l:93.8,c:100},{o:100.5,h:102.5,l:99.5,c:101.5},{o:101,h:101.2,l:94.5,c:95.5}],
    signal: 'Mirror of the morning star at a top: big green → small body at the high → big red closing deep into the first candle.',
    confirm: 'Third candle closes below the midpoint of the first green candle.',
    strategies: ['long-put', 'bear-put-spread', 'collar'],
    play: 'Buy puts / put spreads. If you hold the stock and don’t want to sell, this is the signal to put on a collar.'
  },
  {
    id: 'inside-bar', name: 'Inside Bar / NR Compression', bias: 'neutral',
    candles: [{o:96,h:104,l:95,c:103},{o:102,h:103.2,l:99.8,c:100.5},{o:100.8,h:102,l:100,c:101.2}],
    signal: 'Candle(s) contained entirely within the prior candle’s range. Volatility contracting — energy building for a directional resolution.',
    confirm: 'Trade the BREAK of the mother bar’s high/low, not the pattern itself.',
    strategies: ['long-straddle', 'long-strangle', 'short-call-butterfly'],
    play: 'Volatility is cheap when candles compress: buy a straddle/strangle before the break, especially with an event approaching, or trade the breakout direction with a debit spread once it resolves.'
  },
  {
    id: 'marubozu', name: 'Marubozu (Momentum Candle)', bias: 'trend',
    candles: [{o:98,h:100,l:97,c:99},{o:99,h:108,l:98.9,c:107.8},{o:107.9,h:110,l:106,c:109}],
    signal: 'Full body, no/negligible wicks: one side controlled the entire session. After a base breakout it marks institutional urgency.',
    confirm: 'Breakout marubozu with volume = trend ignition; chase pullbacks, not the candle itself.',
    strategies: ['bull-call-spread', 'long-call', 'long-combo'],
    play: 'Trend-following entries on the first pullback after a breakout marubozu. Debit spreads in the trend direction control the IV you pay after the move starts.'
  },
  {
    id: 'gravestone', name: 'Gravestone Doji', bias: 'bear',
    candles: [{o:95,h:97,l:94,c:96.5},{o:96.5,h:99,l:96,c:98.5},{o:98.5,h:104,l:98.3,c:98.6}],
    signal: 'Open, low and close all at the bottom, long upper wick. The most aggressive form of rally rejection.',
    confirm: 'At resistance / after a gap-up. Next candle red seals it.',
    strategies: ['bear-call-spread', 'long-put', 'covered-call'],
    play: 'Sell call spreads above the wick. The wick high is your invalidation line — clean risk definition.'
  },
  {
    id: 'three-white', name: 'Three White Soldiers', bias: 'bull',
    candles: [{o:95,h:99,l:94.5,c:98.5},{o:98,h:102.5,l:97.5,c:102},{o:101.5,h:106,l:101,c:105.5}],
    signal: 'Three consecutive strong green candles, each opening within and closing beyond the last. Sustained accumulation — a trend is born.',
    confirm: 'After a base or downtrend reversal; shrinking wicks = clean demand.',
    strategies: ['bull-call-spread', 'covered-call', 'short-put'],
    play: 'Trend established: buy call spreads on pullbacks; or own the stock and systematically write covered calls above each new swing high.'
  },
  {
    id: 'dark-cloud', name: 'Dark Cloud Cover', bias: 'bear',
    candles: [{o:95,h:100,l:94.5,c:99.5},{o:101,h:102,l:96.5,c:97},{o:97,h:98,l:93,c:94}],
    signal: 'Gap up open, then a red candle closing below the midpoint of the prior green body. Trapped bulls above = fuel for the decline.',
    confirm: 'Deeper the penetration into the prior body, stronger the signal.',
    strategies: ['long-put', 'bear-call-spread', 'protective-put'],
    play: 'Buy puts targeting the pattern low minus the prior range. Long-term holders: buy protective puts while IV is still calm.'
  }
];

const QUIZ = [
  { q: 'You own 250 Infosys shares bought at ₹2,284 and fear a bad results announcement. Per your course notes, the correct hedge is:',
    opts: ['Buy one more lot of Infosys futures', 'Short Infosys futures (≈1 lot of 250)', 'Sell an OTM put', 'Buy a call option'],
    a: 1, expl: 'Long spot is hedged by an equal-and-opposite SHORT futures position. The notes show net P&L pinned to ≈ +₹1 across all price scenarios.' },
  { q: 'Basis is defined as:', opts: ['Futures price − Spot price', 'Spot price − Futures price', 'Strike − Spot', 'Spot × beta'],
    a: 1, expl: 'Basis = Spot − Futures. Hedging swaps price risk for basis risk: uncertainty in the basis when the hedge is closed out.' },
  { q: 'Optimal hedge ratio h* with σS=0.0263, σF=0.0313, ρ=0.928 is:', opts: ['1.18', '0.78', '0.93', '0.50'],
    a: 1, expl: 'h* = ρ·σS/σF = 0.928 × 0.0263/0.0313 ≈ 0.78 (the airline/jet-fuel example from your notes).' },
  { q: 'Portfolio worth ₹95.5L with beta 1.25; Nifty futures at 9,025, lot 75 (≈₹6.77L per lot). Contracts to short for a full hedge:',
    opts: ['≈ 9', '≈ 14', '≈ 18', '≈ 25'],
    a: 2, expl: 'N = β × VA/VF = 1.25 × 95,50,000 / (9025×75) ≈ 17.6 → ~18 contracts short.' },
  { q: 'A covered call is best described as:',
    opts: ['Buy stock + buy call', 'Own stock + sell OTM call for income', 'Sell stock + sell put', 'Buy call + buy put'],
    a: 1, expl: 'Per your notes: stock owner, neutral-to-moderately-bullish, sells an OTM call and keeps the premium as income unless price exceeds the strike.' },
  { q: 'When should you BUY a straddle rather than sell one?',
    opts: ['When IV is high and falling', 'Before a binary event when IV is low relative to the expected move', 'When the market is range-bound', 'On expiry day to collect theta'],
    a: 1, expl: 'Long straddle = long volatility, short time. It needs a real move bigger than the priced-in move, bought when IV is cheap.' },
  { q: 'Your stock shows a hammer at major support and IV is high. The highest-probability options play is:',
    opts: ['Buy an OTM call', 'Sell a bull put spread below the hammer low', 'Buy a straddle', 'Sell a naked call'],
    a: 1, expl: 'High IV favors selling premium; the hammer low gives a structural level to sell puts under. Buying calls in high IV pays an inflated price.' },
  { q: 'A bull call spread vs a naked long call (same lower strike):',
    opts: ['Has higher cost and higher breakeven', 'Has lower cost, lower breakeven, but capped profit', 'Has unlimited profit', 'Is a bearish strategy'],
    a: 1, expl: 'The short upper call reduces cost, loss, and breakeven (your notes: BE drops from 4270.45) — the trade-off is capped gains.' },
  { q: 'Put-Call Parity for European options states:',
    opts: ['C − P = S − K·e^(−rT)', 'C + P = S + K', 'C − P = K − S', 'C × P = S × K'],
    a: 0, expl: 'C − P = S − PV(K). Deviations are pure arbitrage — this is how mispriced options are detected.' },
  { q: 'Theta for a long ATM option position:',
    opts: ['Works in your favor', 'Is roughly zero', 'Loses value every day, accelerating near expiry', 'Only matters for puts'],
    a: 2, expl: 'Long options bleed theta daily, fastest in the final 2–3 weeks. This is why premium buyers need timing, not just direction.' },
  { q: 'An iron condor makes its maximum profit when:',
    opts: ['Price breaks out strongly upward', 'Price expires between the two short strikes', 'Price crashes', 'IV rises sharply after entry'],
    a: 1, expl: 'It is a range bet: keep the full credit if price stays inside the short strikes. Rising IV after entry actually hurts the position.' },
  { q: 'In the castor-seed example, hedging was imperfect (₹50,000 slippage) because:',
    opts: ['The lot size was wrong', 'The basis changed between hedge initiation and closure', 'Margin calls', 'Options expired'],
    a: 1, expl: 'Basis narrowed from 85 to 80 — basis risk is the residual risk every futures hedger carries.' }
];
