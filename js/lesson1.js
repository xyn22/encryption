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

/* Exercises: answers are recomputed, not hard-coded */

const lesson1Checks = {
  split22: (v) => {
    const ps = [v.p1, v.p2, v.p3].map(int);
    const powersOfTwo = ps.every((p) => Number.isInteger(p) && p > 0 && (p & (p - 1)) === 0);
    return powersOfTwo && new Set(ps).size === 3 && ps.reduce((s, p) => s + p, 0) === 22;
  },
  pow5_13: (v) => int(v.value) === modPow(5, 13, 17),
};

gradeForms($("#l1-exercises"), lesson1Checks);
linkControls($("#w-stepper"), renderStepper);
