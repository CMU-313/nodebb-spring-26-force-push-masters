# k6 Load Test

This folder contains a basic k6 dynamic analysis test for the deployed NodeBB application.

## Run

```bash
k6 run tools/k6/smoke.js

---

## 2. Run the final version and save the output

Run this:

```bash
mkdir -p tools/k6
k6 run tools/k6/smoke.js > tools/k6/k6-output.txt 2>&1