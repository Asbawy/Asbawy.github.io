export interface CastMember {
  id: string;
  name: string;
  roleTag: "Exchange" | "Suspect" | "Forensics" | "Freeze Switch" | "Law Enforcement";
  headline: string;
  summary: string;
  keyStat: string;
}

export interface ConceptItem {
  id: string;
  term: string;
  shortDef: string;
  analogy: string;
  technical: string;
  roleInHeist: string;
}

export interface TimelineFrame {
  id: number;
  timeEt: string;
  timeUtc: string;
  phase: "Staging" | "Blitz" | "Hijack" | "Laundering" | "Containment" | "Recovery";
  title: string;
  headline: string;
  explanation: string;
  whyItMatters: string;
  grossStolenB: number;
  frozenB: number;
  atLargeB: number;
  replenishedB: number;
  activeChains: string[];
  frozenChains: string[];
  eip7702State: "clean" | "staged" | "hijacked" | "revoked";
}

export interface ChainBreakdownItem {
  id: string;
  name: string;
  amountM: number;
  displayAmount: string;
  sharePct: number;
  primaryAssets: string;
  vectorType: "EIP-7702 Hijack" | "Coerced Signatures";
  freezeCategory: "Mixed" | "Unfreezable" | "Mostly Frozen";
  frozenEstimateM: number;
  atLargeEstimateM: number;
  wave: string;
  simpleTakeaway: string;
}

export interface LaunderingStage {
  step: number;
  title: string;
  window: string;
  fromAsset: string;
  toAsset: string;
  simpleExplanation: string;
  defenderAction: string;
}

export interface HistoricalHeist {
  rank: number;
  date: string;
  victim: string;
  amountB: number;
  displayAmount: string;
  actor: string;
  howItHappened: string;
}

export interface DefenseControl {
  id: string;
  title: string;
  layer: string;
  mitigatesM: number;
  summary: string;
}

export interface IocEntry {
  label: string;
  value: string;
  tag: string;
  note: string;
}

export const CAST_MEMBERS: CastMember[] = [
  {
    id: "binance",
    name: "Binance",
    roleTag: "Exchange",
    headline: "World's Largest Crypto Exchange (Victim)",
    summary:
      "Drained across 10 blockchains in an automated blitz. Used corporate reserves and its SAFU emergency fund to cover 100% of customer balances.",
    keyStat: "$6.36B Gross Drained",
  },
  {
    id: "teng",
    name: "Richard Teng",
    roleTag: "Exchange",
    headline: "Co-CEO of Binance",
    summary:
      "Led public crisis response on October 30, confirming a compromised DevOps laptop was the entry point while guaranteeing every user deposit.",
    keyStat: "90%+ Replenished by Oct 31",
  },
  {
    id: "tradertraitor",
    name: "TraderTraitor (Lazarus)",
    roleTag: "Suspect",
    headline: "Suspected North Korean Cyber Unit",
    summary:
      "Elite state-backed group under Pyongyang's Reconnaissance General Bureau. Targets crypto engineers with fake job offers to hijack signing pipelines.",
    keyStat: "High-Confidence Attribution",
  },
  {
    id: "trm-labs",
    name: "TRM Labs",
    roleTag: "Forensics",
    headline: "Blockchain Intelligence & Beacon Network",
    summary:
      "Uncovered the 36-hour Tornado Cash rehearsal, linked the exploit to TraderTraitor with high confidence, and coordinated freeze alerts across issuers.",
    keyStat: "36h Staging Uncovered",
  },
  {
    id: "chainalysis",
    name: "Chainalysis",
    roleTag: "Forensics",
    headline: "On-Chain Forensics Investigator",
    summary:
      "Independently traced the multi-chain outflows, rapid DEX aggregator swaps, and laundering hops to North Korea's TraderTraitor cluster on October 30.",
    keyStat: "Independent Oct 30 Match",
  },
  {
    id: "tether",
    name: "Tether (USDT)",
    roleTag: "Freeze Switch",
    headline: "Largest Dollar-Stablecoin Issuer",
    summary:
      "Triggered emergency smart-contract blacklists at 5:01 PM ET, freezing stolen USDT inside attacker wallets before it could be swapped.",
    keyStat: ">$1.56B Frozen at 5:01 PM",
  },
  {
    id: "circle",
    name: "Circle & Protocol Councils",
    roleTag: "Freeze Switch",
    headline: "USDC Issuer & L2 Governance Responders",
    summary:
      "Circle locked over $800M USDC at 5:04 PM ET. On Oct 30, Arbitrum's Security Council also moved 74.56M ARB and 8,425 ETH (~$30.5M) out of the attacker's reach.",
    keyStat: "$2.7B-$3.0B Total Locked",
  },
  {
    id: "usss-fbi",
    name: "U.S. Secret Service, FBI & IRS-CI",
    roleTag: "Law Enforcement",
    headline: "Federal Incident & Seizure Task Force",
    summary:
      "Coordinated global token freezes within hours and issued the October 31 federal attribution advisory and validator blocklists.",
    keyStat: "Oct 31 Joint Advisory",
  },
];

export const CONCEPTS: ConceptItem[] = [
  {
    id: "hot-wallet",
    term: "Hot Wallet vs. Cold Vault",
    shortDef: "Online cash drawers for instant payouts versus offline steel vaults.",
    analogy:
      "A hot wallet is the cash drawer behind a bank teller's window: kept stocked so customers get paid in seconds. A cold vault sits locked underground with zero internet cables.",
    technical:
      "Hot wallets connect to automated withdrawal microservices. All $6.36B came from operational hot wallets across 10 networks; offline cold storage was untouched.",
    roleInHeist: "Binance held over $2.5B inside a single Ethereum hot wallet ('Binance 14').",
  },
  {
    id: "hsm-multisig",
    term: "Hardware Signer (HSM / Multisig)",
    shortDef: "Sealed hardware boxes that stamp approvals without ever revealing secret keys.",
    analogy:
      "Imagine a mechanical rubber stamp sealed inside a titanium box. Clerks slide checks into a slot to get stamped, so nobody can ever steal the stamp itself.",
    technical:
      "Hardware Security Modules (HSMs), MPC, and multisig quorums isolate private keys in hardware and sign payloads sent by trusted internal containers.",
    roleInHeist:
      "Attackers hijacked the software container feeding checks into the slot, getting valid signatures with zero leaked keys.",
  },
  {
    id: "eip-7702",
    term: "EIP-7702 Delegation",
    shortDef: "An Ethereum feature letting a normal wallet temporarily run smart-contract code.",
    analogy:
      "Like signing a power-of-attorney slip that lets an outside robot attach itself to your checking account and empty every currency inside at once.",
    technical:
      "A Type-4 (0x04) transaction writes 0xef0100 + contract_address into an EOA's code slot, delegating execution while keeping all token balances in place.",
    roleInHeist:
      "Turned 'Binance 14' into attacker sweeper contract 0x63e8...6fAe for a single-block $2.5B+ drain.",
  },
  {
    id: "nonce",
    term: "Transaction Nonce",
    shortDef: "A strict check-number counter (1, 2, 3...) on every Ethereum wallet.",
    analogy:
      "Like numbered paper checks: if check #104 was already cashed a second ago, the bank automatically rejects another slip numbered #104.",
    technical:
      "An EIP-7702 authorization only succeeds if its nonce matches the wallet's live on-chain counter when processed.",
    roleInHeist:
      "Because 'Binance 14' paid users every second, attackers pre-signed 50 consecutive numbers (18,914,775 to 18,914,824) so one was guaranteed to hit.",
  },
  {
    id: "stablecoin-freeze",
    term: "Freezable vs. Unfreezable Crypto",
    shortDef: "USDT and USDC have remote issuer kill-switches; Bitcoin and Ether do not.",
    analogy:
      "Stablecoins work like traveler's checks whose serial numbers can be canceled by phone. Bitcoin and Ether work like melted gold bars.",
    technical:
      "Tether and Circle admin keys can flag an address in smart-contract storage, causing all future transfer() calls to revert.",
    roleInHeist:
      "Bots raced for 37 minutes to swap freezable USDT into unfreezable ETH before Tether's 5:01 PM ET freeze.",
  },
  {
    id: "por",
    term: "Proof of Reserves (PoR)",
    shortDef: "Public math proving an exchange still holds 1:1 liquid funds for every customer.",
    analogy:
      "A glass-walled vault audit where every customer gets a cryptographic receipt proving their balance was counted inside the real cash pile.",
    technical:
      "Combines signed on-chain wallet ownership proofs with a Merkle-tree or zero-knowledge commitment of customer account balances.",
    roleInHeist:
      "Promised for November 2, 2026 to prove customer deposits are backed by fresh corporate reserves rather than frozen hacker wallets.",
  },
];

export const TIMELINE_FRAMES: TimelineFrame[] = [
  {
    id: 0,
    timeEt: "Oct 28, ~4:00 AM ET",
    timeUtc: "08:00 UTC",
    phase: "Staging",
    title: "36 Hours Before: Secret Rehearsal",
    headline: "Tornado Cash gas funding & sweeper contract dry runs",
    explanation:
      "Attacker wallet 0x7C86...5CA0 pulls clean gas money from Tornado Cash and deploys custom sweeper contract 0x63e8...6fAe on Ethereum, testing it on burner wallets while holding quiet access inside Binance.",
    whyItMatters:
      "Testing 36 hours early ensured the contract would sweep 60+ tokens smoothly without failing mid-heist.",
    grossStolenB: 0,
    frozenB: 0,
    atLargeB: 0,
    replenishedB: 0,
    activeChains: [],
    frozenChains: [],
    eip7702State: "staged",
  },
  {
    id: 1,
    timeEt: "Oct 29, 4:05 PM ET",
    timeUtc: "20:05 UTC",
    phase: "Blitz",
    title: "Minute 0: Seven Chains Fire Together",
    headline: "$296M XRP moves first, followed by BTC, Tron, Solana & L2s",
    explanation:
      "From inside Binance's hijacked withdrawal container, scripts feed attacker addresses into the signing engine. XRP drains first (233.46M XRP), immediately followed by Bitcoin (18,270 BTC), Tron ($628M), Solana ($96M), and L2s ($39M).",
    whyItMatters:
      "Hitting every blockchain simultaneously gave defenders zero time to pull a global kill switch after the first alarm.",
    grossStolenB: 2.53,
    frozenB: 0,
    atLargeB: 2.53,
    replenishedB: 0,
    activeChains: ["XRP Ledger", "Bitcoin", "Tron", "Solana", "Arbitrum", "Optimism", "Base"],
    frozenChains: [],
    eip7702State: "staged",
  },
  {
    id: 2,
    timeEt: "Oct 29, 4:20:59 PM ET",
    timeUtc: "20:20:59 UTC",
    phase: "Hijack",
    title: "Minute 16: The 50-Signature Ethereum Trap",
    headline: "Tx 0xad9926...298b attaches sweeper code to 'Binance 14'",
    explanation:
      "Operator 0x7C86...5CA0 broadcasts a single Type-4 Ethereum transaction carrying 50 consecutive pre-signed EIP-7702 slips (nonces 18,914,775 to 18,914,824). Forty-nine miss; one locks onto Binance 14.",
    whyItMatters:
      "Instead of sneaking out 64 tokens one by one, one matched slip turned Binance's main Ethereum wallet into an attacker-controlled robot.",
    grossStolenB: 2.53,
    frozenB: 0,
    atLargeB: 2.53,
    replenishedB: 0,
    activeChains: [
      "Ethereum",
      "XRP Ledger",
      "Bitcoin",
      "Tron",
      "Solana",
      "Arbitrum",
      "Optimism",
      "Base",
    ],
    frozenChains: [],
    eip7702State: "hijacked",
  },
  {
    id: 3,
    timeEt: "Oct 29, 4:24:23 PM ET",
    timeUtc: "20:24:23 UTC",
    phase: "Hijack",
    title: "Minute 19: $2.5B+ Gone in One Block",
    headline: "Tx 0x53bd38...e2f3 empties 167,464 ETH, 1.615B USDT & 63 tokens",
    explanation:
      "Just 204 seconds after the hijack, one trigger transaction sweeps over $2.5B from Binance 14 in a single Ethereum block. Total multi-chain losses cross $6.2B in 20 minutes.",
    whyItMatters:
      "Largest single-transaction crypto theft ever recorded, and Binance 14 keeps auto-skimming fresh user deposits.",
    grossStolenB: 6.28,
    frozenB: 0,
    atLargeB: 6.28,
    replenishedB: 0,
    activeChains: [
      "Ethereum",
      "XRP Ledger",
      "Bitcoin",
      "Tron",
      "Solana",
      "Arbitrum",
      "Optimism",
      "Base",
    ],
    frozenChains: [],
    eip7702State: "hijacked",
  },
  {
    id: 4,
    timeEt: "Oct 29, 4:25-5:00 PM ET",
    timeUtc: "20:25-21:00 UTC",
    phase: "Laundering",
    title: "Minutes 20-55: The 37-Minute DeFi Escape Race",
    headline: "Bots swap USDT via UniswapX & 1inch (plus one Aave borrow) to amass >420,000 ETH",
    explanation:
      "Knowing Tether and Circle will freeze stolen dollar tokens soon, bots swap USDT for Ether through routers like UniswapX and 1inch, accepting steep slippage. One wallet also posts ~$60M USDT on Aave and borrows ~19,762 WETH.",
    whyItMatters:
      "Grew the attackers' Ether pile from ~200,630 ETH to over 420,000 ETH before blacklists landed.",
    grossStolenB: 6.32,
    frozenB: 0,
    atLargeB: 6.32,
    replenishedB: 0,
    activeChains: ["Ethereum"],
    frozenChains: [],
    eip7702State: "hijacked",
  },
  {
    id: 5,
    timeEt: "Oct 29, 5:01 & 5:04 PM ET",
    timeUtc: "21:01 & 21:04 UTC",
    phase: "Containment",
    title: "Minutes 56-59: Tether & Circle Slam the Brakes",
    headline: "Roughly $2.38B frozen within 3 minutes of each other",
    explanation:
      "Tether freezes more than $1.56B USDT at 5:01 PM ET. Circle freezes over $800M USDC at 5:04 PM ET. Follow-up freezes by Ripple, World Liberty Financial, and Arbitrum come over the next day.",
    whyItMatters:
      "Fastest multi-billion-dollar freeze on record, making well over a third of the haul unspendable within an hour.",
    grossStolenB: 6.32,
    frozenB: 2.38,
    atLargeB: 3.94,
    replenishedB: 0,
    activeChains: ["Ethereum"],
    frozenChains: ["Ethereum", "Tron"],
    eip7702State: "hijacked",
  },
  {
    id: 6,
    timeEt: "Oct 29, 7:05-7:56 PM ET",
    timeUtc: "23:05-23:56 UTC",
    phase: "Blitz",
    title: "Hours 3-4: Avalanche & Polygon Wave; Drain Ends",
    headline: "$38M exits AVAX & Polygon before final 7:56 PM Ethereum tx",
    explanation:
      "Secondary signed drains hit Avalanche ($28M) and Polygon ($10M) around 7:05 PM ET as Binance halts withdrawals worldwide. The final major Ethereum outflow clears at 7:56 PM ET ($6.36B total).",
    whyItMatters:
      "Showed how many separate chain queues were reachable from the compromised withdrawal container.",
    grossStolenB: 6.36,
    frozenB: 2.38,
    atLargeB: 3.98,
    replenishedB: 0,
    activeChains: ["Avalanche", "Polygon", "Ethereum"],
    frozenChains: ["Ethereum", "Tron"],
    eip7702State: "hijacked",
  },
  {
    id: 7,
    timeEt: "Oct 29, 8:10 PM ET",
    timeUtc: "Oct 30, 00:10 UTC",
    phase: "Containment",
    title: "8:10 PM ET: Binance Cuts the Cord",
    headline: "Override EIP-7702 transaction wipes sweeper code off 'Binance 14'",
    explanation:
      "Fourteen minutes after the last outflow, Binance engineers regain clean signing control and broadcast an override EIP-7702 authorization, restoring Binance 14 to a normal wallet.",
    whyItMatters:
      "Stopped automated skimming of incoming deposits. By the next morning, Bitcoin had slipped ~5% below $80,000.",
    grossStolenB: 6.36,
    frozenB: 2.38,
    atLargeB: 3.98,
    replenishedB: 0,
    activeChains: [],
    frozenChains: ["Ethereum", "Tron"],
    eip7702State: "revoked",
  },
  {
    id: 8,
    timeEt: "Oct 30 - Nov 2, 2026",
    timeUtc: "Days 2-4",
    phase: "Recovery",
    title: "Attribution, 90%+ Backstop, More Freezes & Reopening",
    headline: "TraderTraitor named; Binance sets aside $6.34B & reopens Nov 1",
    explanation:
      "TRM Labs, Chainalysis (Oct 30), and the FBI (Oct 31) link the heist to North Korea's TraderTraitor. Ripple, World Liberty Financial, and Arbitrum (Oct 30) add freezes, lifting the total to $2.7B-$3.0B. Binance replenishes 90%-95% by Oct 31, begins phased withdrawals Nov 1, and publishes Proof of Reserves results around Nov 2.",
    whyItMatters:
      "Deep treasury reserves prevented a customer bank run while igniting global regulatory scrutiny over hot-wallet limits.",
    grossStolenB: 6.36,
    frozenB: 2.85,
    atLargeB: 3.51,
    replenishedB: 6.34,
    activeChains: [],
    frozenChains: ["Ethereum", "Tron", "Arbitrum"],
    eip7702State: "revoked",
  },
];

export const CHAIN_BREAKDOWN: ChainBreakdownItem[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    amountM: 3800,
    displayAmount: "$3.80B",
    sharePct: 59.7,
    primaryAssets: ">200,630 ETH + 1.615B USDT + 63 ERC-20 tokens",
    vectorType: "EIP-7702 Hijack",
    freezeCategory: "Mixed",
    frozenEstimateM: 2150,
    atLargeEstimateM: 1650,
    wave: "Wave 1 (4:20-4:24 PM ET) + deposit skimming until 7:56 PM",
    simpleTakeaway:
      "Nearly 60% of the entire heist. Huge USDT/USDC chunks were frozen at 5:01-5:04 PM ET, but fast DeFi bots turned hundreds of millions into >420,000 unfreezable ETH.",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    amountM: 1500,
    displayAmount: "$1.50B",
    sharePct: 23.6,
    primaryAssets: "18,270 BTC",
    vectorType: "Coerced Signatures",
    freezeCategory: "Unfreezable",
    frozenEstimateM: 0,
    atLargeEstimateM: 1500,
    wave: "Wave 1 (4:05-4:25 PM ET)",
    simpleTakeaway:
      "Bitcoin has no central company or freeze switch. Every single satoshi of those 18,270 BTC remains in attacker hands.",
  },
  {
    id: "tron",
    name: "Tron",
    amountM: 628,
    displayAmount: "$628M",
    sharePct: 9.9,
    primaryAssets: "612.7M USDT + 46.4M TRX",
    vectorType: "Coerced Signatures",
    freezeCategory: "Mostly Frozen",
    frozenEstimateM: 580,
    atLargeEstimateM: 48,
    wave: "Wave 1 (4:05-4:25 PM ET)",
    simpleTakeaway:
      "Big win for defenders: because 97% of the Tron haul was Tether's USDT, the 5:01 PM ET blacklist trapped almost all of it.",
  },
  {
    id: "xrp",
    name: "XRP Ledger",
    amountM: 296,
    displayAmount: "$296M",
    sharePct: 4.7,
    primaryAssets: "233.46M XRP",
    vectorType: "Coerced Signatures",
    freezeCategory: "Mixed",
    frozenEstimateM: 65,
    atLargeEstimateM: 231,
    wave: "Opening Shot (4:05 PM ET)",
    simpleTakeaway:
      "First alarm of the heist. Native XRP cannot be frozen on-ledger, though Ripple partners and exchanges blocked off-ramp liquidity.",
  },
  {
    id: "solana",
    name: "Solana",
    amountM: 96,
    displayAmount: "$96M",
    sharePct: 1.5,
    primaryAssets: "~970,500 SOL",
    vectorType: "Coerced Signatures",
    freezeCategory: "Unfreezable",
    frozenEstimateM: 5,
    atLargeEstimateM: 91,
    wave: "Wave 1 (4:05-4:25 PM ET)",
    simpleTakeaway:
      "Native SOL has no issuer freeze button. Federal blocklists now track these wallets at every exchange deposit gate.",
  },
  {
    id: "l2s",
    name: "Arbitrum, Optimism & Base",
    amountM: 39,
    displayAmount: "$39M",
    sharePct: 0.6,
    primaryAssets: "ARB, ETH, OP & stablecoins",
    vectorType: "Coerced Signatures",
    freezeCategory: "Mostly Frozen",
    frozenEstimateM: 31,
    atLargeEstimateM: 8,
    wave: "Wave 1 (4:05-4:25 PM ET)",
    simpleTakeaway:
      "Rare protocol-level rescue: on Oct 30, Arbitrum's Security Council temporarily modified the Arbitrum Inbox contract to move 74.56M ARB and 8,425 ETH (~$30.5M) out of the attacker's reach.",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    amountM: 28,
    displayAmount: "$28M",
    sharePct: 0.4,
    primaryAssets: "Native AVAX & tokens",
    vectorType: "Coerced Signatures",
    freezeCategory: "Mixed",
    frozenEstimateM: 8,
    atLargeEstimateM: 20,
    wave: "Wave 2 (~7:05 PM ET)",
    simpleTakeaway:
      "Drained three hours into the crisis before Binance finished severing every secondary chain queue.",
  },
  {
    id: "polygon",
    name: "Polygon",
    amountM: 10,
    displayAmount: "$10M",
    sharePct: 0.2,
    primaryAssets: "POL & ERC-20 tokens",
    vectorType: "Coerced Signatures",
    freezeCategory: "Mixed",
    frozenEstimateM: 4,
    atLargeEstimateM: 6,
    wave: "Wave 2 (~7:05 PM ET)",
    simpleTakeaway:
      "Smallest slice of the ten networks; dollar-pegged tokens were blacklisted while native POL dispersed into sub-wallets.",
  },
];

export const LAUNDERING_STAGES: LaunderingStage[] = [
  {
    step: 1,
    title: "37-Minute DeFi Swap Race",
    window: "4:24 PM - 5:01 PM ET (Oct 29)",
    fromAsset: "Stolen USDT & USDC",
    toAsset: ">420,000 Unfreezable ETH",
    simpleExplanation:
      "Before Tether's 5:01 PM freeze, bots swapped USDT for Ether through routers like UniswapX and 1inch, paying steep slippage. One wallet also posted ~$60M USDT on Aave and borrowed ~19,762 WETH.",
    defenderAction: "Sub-60-second automated issuer freeze switches.",
  },
  {
    step: 2,
    title: "Automated Peel Chains (Typical DPRK Pattern)",
    window: "Days to weeks",
    fromAsset: "420K+ ETH & 18,270 BTC",
    toAsset: "Many Fresh Wallets",
    simpleExplanation:
      "Based on past Lazarus cases, scripts typically slice large piles of Bitcoin and Ether into many smaller hops across brand-new wallets to slow down investigators. (The 18,270 BTC was first split across 19 addresses.)",
    defenderAction: "AI graph clustering (TRM Labs & Chainalysis live feeds).",
  },
  {
    step: 3,
    title: "Cross-Chain Bridges & Mixers",
    window: "Weeks to months",
    fromAsset: "Tracked ETH, SOL & XRP",
    toAsset: "Cross-Swapped BTC & Mixed ETH",
    simpleExplanation:
      "Funds hop across cross-chain protocols like THORChain (some stolen funds were already routed through its vaults) and, as in past DPRK cases, privacy mixers to break the on-chain trail.",
    defenderAction:
      "RPC providers and validators blocking attacker-linked addresses, plus exchange deposit blocklists.",
  },
  {
    step: 4,
    title: "Underground OTC Cash-Out (Typical DPRK Pattern)",
    window: "Months to years",
    fromAsset: "Discounted Crypto",
    toAsset: "Hard Currency & Imports",
    simpleExplanation:
      "In past cases, over-the-counter (OTC) brokers in East and Southeast Asia have bought North Korea's laundered crypto at a discount and converted it into cash or goods for the regime.",
    defenderAction: "Treasury sanctions on OTC brokers and stablecoin seizures.",
  },
];

export const HISTORICAL_HEISTS: HistoricalHeist[] = [
  {
    rank: 1,
    date: "Oct 2026",
    victim: "Binance",
    amountB: 6.36,
    displayAmount: "$6.36 Billion",
    actor: "TraderTraitor (DPRK - Suspected)",
    howItHappened:
      "DevOps laptop -> withdrawal container -> 50-nonce EIP-7702 hijack + 10-chain signing coercion.",
  },
  {
    rank: 2,
    date: "Feb 2025",
    victim: "Bybit",
    amountB: 1.5,
    displayAmount: "$1.50 Billion",
    actor: "TraderTraitor / Lazarus (DPRK)",
    howItHappened:
      "Compromised Safe multisig developer laptop -> poisoned UI tricked signers into upgrading wallet code.",
  },
  {
    rank: 3,
    date: "Mar 2022",
    victim: "Ronin Network",
    amountB: 0.625,
    displayAmount: "$625 Million",
    actor: "Lazarus Group (DPRK)",
    howItHappened:
      "Fake LinkedIn job offer PDF compromised validator nodes to reach multisig threshold.",
  },
  {
    rank: 4,
    date: "Aug 2021",
    victim: "Poly Network",
    amountB: 0.611,
    displayAmount: "$611 Million",
    actor: "Independent Hacker (Returned)",
    howItHappened: "Smart-contract cross-chain privilege bug (attacker later returned the funds).",
  },
];

export const DEFENSE_CONTROLS: DefenseControl[] = [
  {
    id: "block-7702",
    title: "Block EIP-7702 (0x04) Inside Hardware",
    layer: "Signing Firmware",
    mitigatesM: 2550,
    summary:
      "Program hardware signers to reject Type-4 delegation slips outright so an exchange wallet can never mutate into a smart contract.",
  },
  {
    id: "hot-caps",
    title: "$50M Wallet Cap & 60s Hardware Kill-Switch",
    layer: "Liquidity Design",
    mitigatesM: 2950,
    summary:
      "Split hot funds into small $50M drawers and freeze all chains inside hardware if outflows ever pass $50M in one minute.",
  },
  {
    id: "ledger-oracle",
    title: "Independent User-Withdrawal Cross-Check",
    layer: "Zero-Trust Pipeline",
    mitigatesM: 810,
    summary:
      "Force the hardware box to verify every payout address against a separate, read-only database of real MFA-approved customer tickets.",
  },
  {
    id: "instant-freeze",
    title: "60-Second Automated Stablecoin Freeze Rail",
    layer: "Issuer Safe-Harbor",
    mitigatesM: 50,
    summary:
      "Legal safe harbor letting Tether and Circle trigger automated 24-hour holds in under 60 seconds, closing the 37-minute DeFi escape gap.",
  },
];

export const IOC_LIST: IocEntry[] = [
  {
    label: "Hijacked Binance Hot Wallet ('Binance 14')",
    value: "0x28C6c06298d514Db089934071355E5743bf21d60",
    tag: "VICTIM EOA",
    note: "Delegation revoked Oct 30, 00:10 UTC (8:10 PM ET)",
  },
  {
    label: "Attacker Operator & Type-4 Caller",
    value: "0x7C8601d4645b93cea45F71e118A729332e6B5CA0",
    tag: "ATTACKER",
    note: "Seeded via Tornado Cash ~36 hours prior",
  },
  {
    label: "Malicious EIP-7702 Batch Sweeper Contract",
    value: "0x63e842B054Bd624a465454D533C33F573e9c6fAe",
    tag: "SWEEPER",
    note: "Unverified contract ('Exploiter 24') tested on burner wallets",
  },
  {
    label: "50-Nonce EIP-7702 Hijack Transaction",
    value: "0xad99264d5532ae0dd04b2004eebda05f25657e70dacb764f7ac8d4ccd051298b",
    tag: "TX HASH",
    note: "Oct 29, 20:20:59 UTC (nonces 18,914,775 to 18,914,824)",
  },
  {
    label: "Single-Block $2.5B+ Sweep Transaction",
    value: "0x53bd38b816c23e74134786c29a8c18d792777998a3b9326047b583100e88e2f3",
    tag: "TX HASH",
    note: "Oct 29, 20:24:23 UTC (167,464 ETH + 1.615B USDT + 63 ERC-20s)",
  },
  {
    label: "On-Chain EIP-7702 Code-Slot Signature",
    value: "0xef010063e842b054bd624a465454d533c33f573e9c6fae",
    tag: "BYTECODE",
    note: "0xef0100 delegation prefix + sweeper contract address",
  },
];
