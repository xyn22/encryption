"use strict";

const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children.flat());
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs = {}, ...children) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.append(...children);
  return node;
}

function pow(a, b) {
  return [String(a), el("sup", {}, String(b))];
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

// Inputs stay below ~1e6 so products fit safely in a double.
function modPow(base, exp, n) {
  let result = 1 % n;
  let sq = base % n;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * sq) % n;
    sq = (sq * sq) % n;
    exp = Math.floor(exp / 2);
  }
  return result;
}

function table(headers, rows) {
  return el("table", {},
    el("thead", {}, el("tr", {}, headers.map((h) => el("th", {}, h)))),
    el("tbody", {}, rows.map((r) =>
      el("tr", r.cls ? { class: r.cls } : {}, r.cells.map((c) => el("td", {}, c))))));
}

// Each range input with an id pairs with a number input carrying data-mirror="<id>".
// The number input is the source of truth, so it may exceed the slider's range.
function linkControls(root, onChange) {
  root.querySelectorAll('input[type="range"]').forEach((range) => {
    const box = root.querySelector(`input[data-mirror="${range.id}"]`);
    box.value = range.value;
    range.addEventListener("input", () => { box.value = range.value; onChange(); });
    box.addEventListener("input", () => {
      if (box.value === "") return;
      range.value = box.value;
      onChange();
    });
  });
  onChange();
}

// Each <form data-check="name"> is graded by checks[name](values), where values
// maps input names to their raw string values.
function gradeForms(root, checks) {
  root.querySelectorAll("form[data-check]").forEach((form) => {
    const out = form.querySelector("output");
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const right = checks[form.dataset.check](Object.fromEntries(new FormData(form)));
      out.textContent = right ? "✓ Right" : "✗ Wrong";
      out.className = right ? "right" : "wrong";
    });
    form.addEventListener("input", () => {
      out.textContent = "";
      out.className = "";
    });
  });
}

function int(v) {
  return v === undefined || String(v).trim() === "" ? NaN : Number(v);
}

function num(id) {
  const box = document.querySelector(`input[data-mirror="${id}"]`);
  const v = Math.round(Number(box.value));
  const lo = Number(box.min);
  const hi = Number(box.max);
  return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo;
}
