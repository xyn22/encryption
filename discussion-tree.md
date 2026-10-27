# Learning RSA — discussion tree

Profile: knows symmetric idea, public/private + signatures conceptually; math: primes, mod.
Goal: do a tiny RSA example by hand. Style: mixed (explain + quiz).

Tracked in git on purpose (user's choice, 2026-10-27) so cloud/iOS agents can read it.
Visualizer: index.html + css/styles.css + js/common.js + js/lessonN.js (one section + one script per lesson).
Page lessons ≠ node IDs: page L1 = node 1.1/1.1.2 (computing powers), page L2 = node 1.1.1 (loops/tails), page L3.. = nodes 1.2.. (inverses onward).

- [ ] 1 How does RSA work, well enough to do it by hand?
  - [x] 1.1 Modular exponentiation — solved all 3; spotted cycles (4^2≡1 mod 15) unprompted. Seeds Euler in 1.3.
    - [ ] 1.1.1 Why does "exponent only matters mod loop length" hold, and how does it bring m back? <- current
      - Taught 4 steps (pigeonhole, restart at 1, clock, k·L+1) + toy RSA n=15,e=d=3.
      - Exercises: powers of 3 mod 7; 3^100 mod 7; exponents giving 3; does e=3,d=5 work for n=15?
      - [x] 1.1.1.1 Does the loop rule hold for any multiplier? — Fixed c: yes (x·c^k). Varying: no. General: any f(current) on finite set cycles; full return needs gcd(c,n)=1 (2 mod 12 has a tail). Mini-check: 3·2^k mod 18. Refined: loop length of x·c^k divides ord(c); equal iff gcd(x,n)=1 (mod 12, c=5, x=6 → length 1).
      - Later (1.5/1.7): RSA still works when gcd(m,n)≠1 (CRT argument).
    - [x] 1.1.2 How does square-and-multiply work, step by step? — Got it: 2^11 mod 13 = 7 correct. Nudged: build every row by squaring the previous (2^4≡3 is a stepping stone), never compute 256.
      - Reopened: user gets one-at-a-time, not S&M. Re-taught with 3^13 mod 11 (split 8+4+1, square table 3,9,4,5, multiply → 5).
      - Page default 4^13 mod 15 is a bad demo (squares collapse to 1); offered to change to 3,13,11.
      - Exercise: 2^11 mod 13. (Old check a^22 = a^16·a^4·a^2 still open.)
  - [ ] 1.2 GCD and modular inverses: what does "d is the inverse of e mod φ(n)" mean? (paused; 3 exercises pending)
    - Exercises given: inv 3 mod 10; why 2 has none mod 10; inv 7 mod 40. Then teach extended Euclid.
  - [ ] 1.3 Euler's totient φ(n): why φ(p·q) = (p−1)(q−1)?
    - [x] 1.3.1 Is Euler conditional on a^φ≡1? — No: only needs gcd(a,n)=1; φ is a count, loop lengths divide it (n=15 table).
  - [ ] 1.4 Key generation: pick p, q → n, φ, e, d
  - [ ] 1.5 Encrypt/decrypt a number by hand (and why it round-trips)
  - [ ] 1.6 Signing by hand (reverse roles of e and d)
  - [ ] 1.7 Why it's secure: factoring is hard; why toy RSA is not secure (padding, size)
