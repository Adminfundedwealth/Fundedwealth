const {Client}=require("pg");
const c=new Client({connectionString:"postgresql://postgres:Supabasefunded%402026@db.nysrxvpjdlvzvcawysvh.supabase.co:5432/postgres",ssl:{rejectUnauthorized:false}});
async function run(){
  await c.connect();
  const cols=await c.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='notifications' ORDER BY ordinal_position");
  console.log("notifications columns:",cols.rows.map(r=>r.column_name).join(", "));
  const pcols=await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='payouts' ORDER BY ordinal_position");
  console.log("payouts columns:",pcols.rows.map(r=>r.column_name).join(", "));
  // Try exact query that notifications route does
  try{
    const r=await c.query("SELECT id FROM notifications WHERE user_id='c458d079-f187-4aa3-b1b5-c45ada777b72'::uuid LIMIT 1");
    console.log("notifications query OK, rows:",r.rowCount);
  }catch(e){console.log("notifications query FAIL:",e.message);}
  await c.end();
}
run().catch(e=>console.error(e.message));
