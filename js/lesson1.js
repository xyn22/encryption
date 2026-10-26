"use strict";

/* 1a: reduce as you go */

function renderStepper() {
  const a = num("l1a-a");
  const b = num("l1a-b");
  const n = num("l1a-n");
  const result = modPow(a, b, n);
  const digits = Math.floor(b * Math.log10(a)) + 1;

  $("#l1a-result").replaceChildren(
    el("span", { class: "big" }, pow(a, b), ` mod ${n} = `, el("strong", {}, String(result))),
    el("span", { class: "note" }, pow(a, b), ` itself has ${digits} digits. We never touch it.`));

  const bits = [];
  for (let e = b; e > 0; e = Math.floor(e / 2)) bits.push(e % 2);
  const ones = bits.filter(Boolean).length;
  const fastSteps = bits.length - 1 + ones - 1;

  const linear = $("#l1a-linear");
  if (b > 40) {
    linear.replaceChildren(el("p", { class: "note" },
      `${b} multiplications one at a time. Square-and-multiply needs ${fastSteps}.`));
  } else {
    const rows = [];
    let v = 1;
    let peak = 0;
    for (let k = 1; k <= b; k++) {
      const prod = v * a;
      peak = Math.max(peak, prod);
      rows.push({ cells: [String(k), `${v} × ${a} = ${prod}`, String(prod % n)], cls: prod >= n ? "reduced" : "" });
      v = prod % n;
    }
    linear.replaceChildren(
      table(["k", "previous × a", "mod n"], rows),
      el("p", { class: "note" }, `Largest number ever handled: ${peak}. ${b} multiplications.`));
  }

  const rows = [];
  const usedTerms = [];
  let sq = a % n;
  let acc = 1 % n;
  bits.forEach((bit, i) => {
    const p = 2 ** i;
    if (bit) {
      acc = (acc * sq) % n;
      usedTerms.push({ p, v: sq });
    }
    rows.push({ cells: [[`${a}`, el("sup", {}, String(p))], String(sq), bit ? "✓ used" : ""], cls: bit ? "used" : "unused" });
    sq = (sq * sq) % n;
  });
  usedTerms.reverse();
  $("#l1a-squares").replaceChildren(
    el("p", { class: "note" }, `Square repeatedly (each row = previous row squared, mod ${n}).`),
    table(["power", `mod ${n}`, `in b = ${usedTerms.map((t) => t.p).join(" + ")}`], rows),
    el("p", {}, `${usedTerms.map((t) => t.v).join(" × ")} mod ${n} = `, el("strong", {}, String(acc))),
    el("p", { class: "note" }, `${fastSteps} multiplications.`));
}

/* 1b: the walk x·a^k mod n */

function analyzeWalk(a, n, x) {
  const seen = new Map();
  const seq = [];
  let v = x % n;
  while (!seen.has(v)) {
    seen.set(v, seq.length);
    seq.push(v);
    v = (v * a) % n;
  }
  const mu = seen.get(v);
  return { seq, mu, lam: seq.length - mu };
}

function drawWalk(svg, n, seq, mu, current) {
  const size = 420;
  const c = size / 2;
  const R = c - 34;
  const r = n > 30 ? 9 : n > 18 ? 11 : 14;
  const pos = (i) => {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [c + R * Math.cos(t), c + R * Math.sin(t), Math.cos(t), Math.sin(t)];
  };

  const marker = (id, color) => svgEl("marker",
    { id, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" },
    svgEl("path", { d: "M0,0 L10,5 L0,10 z", fill: color }));
  const defs = svgEl("defs", {}, marker("arrow-loop", "#6aa8ff"), marker("arrow-tail", "#ffa657"));

  const edges = seq.map((from, j) => {
    const to = j + 1 < seq.length ? seq[j + 1] : seq[mu];
    const kind = j < mu ? "tail" : "loop";
    const [fx, fy, ux0, uy0] = pos(from);
    if (from === to) {
      return svgEl("circle", { class: `edge ${kind}`, cx: fx + ux0 * (r + 8), cy: fy + uy0 * (r + 8), r: 8 });
    }
    const [tx, ty] = pos(to);
    const len = Math.hypot(tx - fx, ty - fy);
    const ux = (tx - fx) / len;
    const uy = (ty - fy) / len;
    return svgEl("line", {
      class: `edge ${kind}`,
      x1: fx + ux * r, y1: fy + uy * r, x2: tx - ux * (r + 2), y2: ty - uy * (r + 2),
      "marker-end": `url(#arrow-${kind})`,
    });
  });

  const index = new Map(seq.map((v, i) => [v, i]));
  const nodes = [];
  for (let v = 0; v < n; v++) {
    const [x, y] = pos(v);
    const i = index.get(v);
    const cls = ["node", i === undefined ? "idle" : i < mu ? "tail" : "loop"];
    if (v === seq[0]) cls.push("start");
    if (v === current) cls.push("current");
    nodes.push(svgEl("g", { class: cls.join(" ") },
      svgEl("circle", { cx: x, cy: y, r }),
      svgEl("text", { x, y }, String(v))));
  }

  svg.replaceChildren(defs, ...edges, ...nodes);
}

function renderWalk() {
  const a = num("l1b-a");
  const n = num("l1b-n");
  $("#l1b-x").max = String(n - 1);
  const x = num("l1b-x") % n;
  const k = num("l1b-k");

  const { seq, mu, lam } = analyzeWalk(a, n, x);
  const idx = k < mu ? k : mu + ((k - mu) % lam);
  const value = seq[idx];
  const direct = (x * modPow(a, k, n)) % n;
  const powersLoop = analyzeWalk(a, n, 1).lam;

  drawWalk($("#l1b-svg"), n, seq, mu, value);

  $("#l1b-chips").replaceChildren(
    ...seq.map((v, i) => {
      const cls = ["chip"];
      if (i < mu) cls.push("tail");
      if (i === idx) cls.push("current");
      return el("span", { class: cls.join(" "), title: `k = ${i}` }, String(v));
    }),
    el("span", { class: "chip repeat", title: "the walk repeats from here" }, `${seq[mu]} …`));

  const stat = (label, val) => [el("dt", {}, label), el("dd", {}, val)];
  $("#l1b-stats").replaceChildren(
    ...stat("tail length", String(mu)),
    ...stat("loop length λ", String(lam)),
    ...stat(`loop of powers of ${a}`, `${powersLoop} (λ divides it)`),
    ...stat(`gcd(a, n)`, String(gcd(a, n))),
    ...stat(`gcd(x, n)`, String(gcd(x, n))));

  const q = Math.floor((k - mu) / lam);
  const rem = (k - mu) % lam;
  const how = k < mu
    ? `k = ${k} is still in the tail, so read step ${k} directly.`
    : `k = ${mu ? `${mu} + ` : ""}${q}·${lam} + ${rem}: skip ${q} full loops, land on step ${idx}.`;
  $("#l1b-explain").replaceChildren(
    el("span", { class: "big" }, `${x} · `, pow(a, k), ` mod ${n} = `, el("strong", {}, String(value))),
    el("span", { class: "note" }, how),
    el("span", { class: "note" }, `Check with square-and-multiply: ${direct} ${direct === value ? "✓" : "✗"}`));

  const insights = [];
  if (gcd(a, n) === 1) {
    insights.push(`a is coprime to n: no tail, the walk returns to its start every ${lam} steps.`);
    insights.push(`So x·a^k ≡ x whenever k ≡ 0 (mod ${lam}), and x·a^k ≡ x·a whenever k ≡ 1 (mod ${lam}).`);
  } else {
    insights.push(`a shares the factor ${gcd(a, n)} with n: the walk can fall into a loop it never leaves${mu ? ` (tail of ${mu})` : ""}.`);
  }
  if (gcd(x, n) !== 1 && lam < powersLoop) {
    insights.push(`x shares a factor with n, so this loop (${lam}) is shorter than the powers' loop (${powersLoop}).`);
  }
  $("#l1b-insights").replaceChildren(...insights.map((t) => el("li", {}, t)));
}

/* 1c: toy RSA round trip */

function renderRsa() {
  const n = num("l1c-n");
  const e = num("l1c-e");
  const d = num("l1c-d");
  let ok = 0;
  const cells = [];
  for (let m = 0; m < n; m++) {
    const c = modPow(m, e, n);
    const back = modPow(c, d, n);
    const good = back === m;
    if (good) ok++;
    const cls = ["cell", good ? "ok" : "bad"];
    if (gcd(m, n) > 1) cls.push("shared");
    cells.push(el("div", { class: cls.join(" ") }, `${m} → ${c} → ${back}`));
  }
  $("#l1c-summary").replaceChildren(
    el("span", { class: "big" }, `${ok} / ${n} messages come back`),
    el("span", { class: "note" }, `e·d = ${e * d}. Which values of e·d − 1 work for this n? Look for a pattern.`));
  $("#l1c-grid").replaceChildren(...cells);
}

/* Exercises: answers are recomputed, not hard-coded */

function roundTripsAll(n, e, d) {
  for (let m = 0; m < n; m++) if (modPow(modPow(m, e, n), d, n) !== m) return false;
  return true;
}

const lesson1Checks = {
  loopLength: (v) => int(v.len) === analyzeWalk(3, 7, 1).lam,
  pow100: (v) => int(v.value) === modPow(3, 100, 7),
  backToThree: (v) => {
    const xs = [v.x1, v.x2, v.x3].map(int);
    const valid = xs.every((x) => Number.isInteger(x) && x >= 0 && modPow(3, x, 7) === 3);
    const lam = analyzeWalk(3, 7, 1).lam;
    return valid && new Set(xs).size === 3 && int(v.mult) === lam && int(v.offset) === 1;
  },
  rsaPair: (v) => v.works === (roundTripsAll(15, 3, 5) ? "yes" : "no"),
  tail18: (v) => {
    const { mu } = analyzeWalk(2, 18, 3);
    return v.hasTail === (mu > 0 ? "yes" : "no") && int(v.len) === mu;
  },
};

gradeForms($("#w-exercises"), lesson1Checks);
linkControls($("#w-stepper"), renderStepper);
linkControls($("#w-cycle"), renderWalk);
linkControls($("#w-rsa"), renderRsa);
