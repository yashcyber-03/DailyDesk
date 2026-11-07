import { test } from "node:test";
import assert from "node:assert/strict";
import { percentOf, whatPercent, percentChange } from "../src/lib/calc/percentage.ts";
import { calculateEmi } from "../src/lib/calc/emi.ts";
import { calculateGst } from "../src/lib/calc/gst.ts";
import { calculateDiscount } from "../src/lib/calc/discount.ts";
import { calculateBmi, bmiCategory, feetInchesToCm, poundsToKg } from "../src/lib/calc/bmi.ts";
import { calculateAge } from "../src/lib/calc/age.ts";
import { convertUnit } from "../src/lib/calc/units.ts";

const close = (a: number, b: number, tol = 1e-6) => assert.ok(Math.abs(a - b) <= tol, `${a} !~ ${b}`);

test("percentage", () => {
  const a = percentOf(20, 150);
  assert.ok(a.ok); close(a.value, 30);
  const b = whatPercent(30, 150);
  assert.ok(b.ok); close(b.value, 20);
  const c = percentChange(80, 100);
  assert.ok(c.ok); close(c.value, 25);
  const d = percentChange(100, 80);
  assert.ok(d.ok); close(d.value, -20);
  assert.equal(whatPercent(5, 0).ok, false);
  assert.equal(percentChange(0, 5).ok, false);
});

test("emi", () => {
  const r = calculateEmi(1_000_000, 10, 120);
  assert.ok(r.ok);
  close(r.value.emi, 13215.07, 0.01);
  close(r.value.totalPayment, r.value.emi * 120, 1e-6);
  close(r.value.totalInterest, r.value.totalPayment - 1_000_000, 1e-6);
  const zero = calculateEmi(120000, 0, 12);
  assert.ok(zero.ok); close(zero.value.emi, 10000);
  assert.equal(calculateEmi(0, 10, 12).ok, false);
  assert.equal(calculateEmi(1000, -1, 12).ok, false);
  assert.equal(calculateEmi(1000, 10, 12.5).ok, false);
  assert.equal(calculateEmi(1000, 10, 601).ok, false);
});

test("gst", () => {
  const add = calculateGst(1000, 18, "add");
  assert.ok(add.ok);
  assert.deepEqual([add.value.net, add.value.gst, add.value.total, add.value.cgst], [1000, 180, 1180, 90]);
  const rem = calculateGst(1180, 18, "remove");
  assert.ok(rem.ok);
  assert.deepEqual([rem.value.net, rem.value.gst, rem.value.total], [1000, 180, 1180]);
  assert.equal(calculateGst(-1, 18, "add").ok, false);
  assert.equal(calculateGst(100, 101, "add").ok, false);
});

test("discount", () => {
  const r = calculateDiscount(1000, 20);
  assert.ok(r.ok); close(r.value.finalPrice, 800); close(r.value.saved, 200);
  const s = calculateDiscount(1000, 20, 10);
  assert.ok(s.ok); close(s.value.finalPrice, 720); close(s.value.effectivePercent, 28);
  assert.equal(calculateDiscount(0, 10).ok, false);
  assert.equal(calculateDiscount(100, 120).ok, false);
});

test("bmi", () => {
  const r = calculateBmi(70, 175);
  assert.ok(r.ok); assert.equal(r.value.bmi, 22.9); assert.equal(r.value.category, "Normal weight");
  assert.equal(bmiCategory(18.4), "Underweight");
  assert.equal(bmiCategory(18.5), "Normal weight");
  assert.equal(bmiCategory(25), "Overweight");
  assert.equal(bmiCategory(30), "Obese");
  close(feetInchesToCm(5, 10), 177.8);
  close(poundsToKg(154.324), 70, 0.01);
  assert.equal(calculateBmi(70, 10).ok, false);
  assert.equal(calculateBmi(1, 170).ok, false);
});

test("age", () => {
  const a = calculateAge("1990-05-15", "2026-11-01");
  assert.ok(a.ok);
  assert.deepEqual([a.value.years, a.value.months, a.value.days], [36, 5, 17]);
  assert.equal(a.value.totalDays, Math.round((Date.UTC(2026, 10, 1) - Date.UTC(1990, 4, 15)) / 86400000));
  assert.equal(a.value.daysToNextBirthday, Math.round((Date.UTC(2027, 4, 15) - Date.UTC(2026, 10, 1)) / 86400000));
  assert.equal(a.value.birthWeekday, "Tuesday");
  const b = calculateAge("2000-01-31", "2000-03-01");
  assert.ok(b.ok); assert.deepEqual([b.value.years, b.value.months, b.value.days], [0, 1, 1]);
  const leap = calculateAge("2000-02-29", "2026-02-28");
  assert.ok(leap.ok);
  assert.deepEqual([leap.value.years, leap.value.months, leap.value.days], [25, 11, 30]);
  assert.equal(leap.value.daysToNextBirthday, 0);
  const same = calculateAge("2026-11-01", "2026-11-01");
  assert.ok(same.ok); assert.equal(same.value.totalDays, 0);
  assert.equal(calculateAge("2030-01-01", "2026-11-01").ok, false);
  assert.equal(calculateAge("2023-02-31", "2026-11-01").ok, false);
  assert.equal(calculateAge("", "2026-11-01").ok, false);
});

test("units", () => {
  const mi = convertUnit("length", "mi", "km", 1);
  assert.ok(mi.ok); close(mi.value, 1.609344);
  const ft = convertUnit("length", "ft", "in", 1);
  assert.ok(ft.ok); close(ft.value, 12);
  const t = convertUnit("temperature", "c", "f", 100);
  assert.ok(t.ok); close(t.value, 212);
  const k = convertUnit("temperature", "k", "c", 0);
  assert.ok(k.ok); close(k.value, -273.15);
  assert.equal(convertUnit("temperature", "c", "k", -300).ok, false);
  const acre = convertUnit("area", "acre", "ft2", 1);
  assert.ok(acre.ok); close(acre.value, 43560, 1e-4);
  const kmh = convertUnit("speed", "kmh", "ms", 36);
  assert.ok(kmh.ok); close(kmh.value, 10);
  const lb = convertUnit("weight", "lb", "kg", 1);
  assert.ok(lb.ok); close(lb.value, 0.45359237);
  const gal = convertUnit("volume", "gal", "cup", 1);
  assert.ok(gal.ok); close(gal.value, 16);
  assert.equal(convertUnit("length", "m", "zz", 1).ok, false);
});
