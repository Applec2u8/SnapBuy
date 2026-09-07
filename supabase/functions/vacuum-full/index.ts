import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) {
      return new Response(
        JSON.stringify({ ok: false, error: "SUPABASE_DB_URL not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ใช้ lazy: false เพื่อ connect ทันที
    const pool = new Pool(dbUrl, 1, false);
    const client = await pool.connect();

    try {
      // ── Step 1: ดึงรายชื่อตารางทั้งหมด ───────────────────────
      const tablesResult = await client.queryObject<{ schemaname: string; tablename: string }>(`
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);

      const tables = tablesResult.rows;

      // ── Step 2: รัน VACUUM FULL ทีละตาราง นอก transaction ───
      // VACUUM ไม่สามารถรันใน DO block หรือ transaction ได้
      // แต่ query ที่ส่งผ่าน pool client โดยตรง (ไม่มี BEGIN/COMMIT) รันนอก transaction ได้
      let vacuumedCount = 0;
      const vacuumedTables: string[] = [];

      for (const { schemaname, tablename } of tables) {
        const fullName = `"${schemaname}"."${tablename}"`;
        await client.queryArray(`VACUUM FULL ${fullName}`);
        vacuumedCount++;
        vacuumedTables.push(tablename);
      }

      const elapsed = Date.now() - startTime;

      return new Response(
        JSON.stringify({
          ok: true,
          message: `VACUUM FULL สำเร็จ — ล้าง dead tuples จาก ${vacuumedCount} ตาราง และคืนพื้นที่ disk แล้ว`,
          vacuumed_count: vacuumedCount,
          vacuumed_tables: vacuumedTables,
          elapsed_ms: elapsed,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } finally {
      client.release();
      await pool.end();
    }
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    console.error("VACUUM FULL error:", err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: err?.message ?? "Unknown error",
        elapsed_ms: elapsed,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
