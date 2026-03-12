/**
 * Small target script for Jalangi2 dynamic analysis (Project 3A tool evaluation).
 * ES5-friendly so Jalangi can instrument it; exercises basic operations for CheckNaN etc.
 */
function add(a, b) {
  return a + b;
}
function concat(x, y) {
  return String(x) + String(y);
}
var n = add(1, 2);
var s = concat("hello", " world");
var maybeNaN = add(1, undefined);
console.log("n=" + n, "s=" + s);
