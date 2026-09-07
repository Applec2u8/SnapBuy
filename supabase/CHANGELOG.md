# SnapBuy — Database Changelog

> ไฟล์นี้บันทึกการเปลี่ยนแปลง Database ทั้งหมด  
> หากทำการอัปเดต `setup.sql` ให้เพิ่ม entry ใหม่ด้านบนสุดเสมอ

---

## [2026-07-15] — Consolidated Single Setup File

**ไฟล์ที่เปลี่ยน:** `setup.sql` (สร้างใหม่จาก schema.sql + 27 migration files)

### เพิ่มใหม่
- `quota_packages` table — เก็บแพ็คเกจโควต้าที่ขายได้ (name, product_limit, category_limit, duration_days, price, badge)
- `quota_history` table — บันทึกประวัติการซื้อ/redeem โควต้าของแต่ละร้าน
- `shop_categories` table — เก็บ category ที่แต่ละร้านสามารถขายได้ (จำกัดตาม category_limit)
- `product_boosts` table — เก็บ boost session ที่ active อยู่ (views/likes boost)
- `conversations` + `messages` tables — ระบบ chat ระหว่าง user ↔ shop
- `support_channels` table — ช่องทางติดต่อ support (phone, facebook, line ฯลฯ)
- `site_settings` table — ค่า settings ของเว็บไซต์

### เปลี่ยนแปลง
- `profiles` table — เพิ่ม `wallet_balance`, `token_balance`, auto boost fields
- `shops` table — เพิ่ม `category_limit`, `price`, ปรับ `product_limit` default จาก 50 → 10
- `products` table — เพิ่ม `is_promoted`, `promote_type`, `promoted_at`, `promoted_until`
- `orders` table — เพิ่ม `shop_id`, `total_price` column

### Functions ใหม่
| Function | หน้าที่ |
|----------|---------|
| `buy_quota_package(shop_id, package_id)` | ซื้อโควต้าด้วย wallet (สะสม ไม่ reset) |
| `redeem_store_quota(code, shop_id)` | Redeem quota code (สะสม ไม่ reset) |
| `boost_product_wallet(...)` | Boost product ด้วย wallet |
| `promote_product(...)` | Promote product ด้วย wallet |
| `admin_top_up_wallet(user_id, amount)` | Admin เติม wallet ให้ user |
| `admin_deduct_wallet(user_id, amount)` | Admin หัก wallet จาก user |
| `pay_with_wallet(amount)` | User จ่ายด้วย wallet |
| `process_auto_boosts()` | Engine สำหรับ auto boost (รันทุกนาที) |
| `boost_frequency_to_interval(freq)` | แปลง frequency string → SQL interval |

### ลบออก
- ระบบ Token ออกจาก Admin UI (เหลือแค่ Wallet)
- `BuyTokenModal.tsx` — ลบออกจาก frontend
- migration files ทั้ง 27 ไฟล์ — รวมเข้า setup.sql แล้ว
- `schema.sql` เก่า — แทนด้วย setup.sql

### Seed Data
- Categories 18 หลัก + 27 ย่อย
- Quota packages: Starter (ฟรี), Basic, Pro, Business, Enterprise
- Support channels: phone, facebook, whatsapp, line, email, instagram, website

---

## [2026-07-14] — Wallet System & Quota Accumulation Fix

### เปลี่ยนแปลง
- **Quota accumulation:** ซื้อโควต้าใหม่ **สะสม** ต่อจากเดิม ไม่ reset
- **Quota expiry accumulation:** วันหมดอายุสะสมต่อจากวันเดิม (ถ้ายังไม่หมด)
- **Boost system:** เปลี่ยนจาก Token → Wallet payment สำหรับ BulkBoost และ PromoteProduct
- **Category limit:** เพิ่มระบบจำกัด category ต่อร้าน
- **Free quota code redeem:** ย้าย UI ไปอยู่ใน VendorQuota page

---

## วิธีอัปเดต Database

### กรณีสร้าง Database ใหม่ (แนะนำ)
```
Supabase → SQL Editor → วาง setup.sql → Run
```

### กรณีอัปเดตบน Database ที่มีอยู่แล้ว
1. เขียน SQL เฉพาะส่วนที่เปลี่ยน (ALTER TABLE, CREATE OR REPLACE FUNCTION ฯลฯ)
2. รันใน Supabase SQL Editor
3. อัปเดต `setup.sql` ให้ตรงกับ DB จริง
4. เพิ่ม entry ใหม่ใน `CHANGELOG.md` นี้

---

## ไฟล์ใน supabase/

| ไฟล์ | หน้าที่ |
|------|---------|
| `setup.sql` | **SQL ไฟล์เดียวสำหรับสร้าง DB ใหม่** |
| `seed_realistic_products.ts` | Script สำหรับ seed สินค้าตัวอย่าง (optional) |
| `CHANGELOG.md` | บันทึกการเปลี่ยนแปลง (ไฟล์นี้) |
