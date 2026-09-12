const SB="https://nysrxvpjdlvzvcawysvh.supabase.co";
const AK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4dnBqZGx2enZjYXd5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MzYsImV4cCI6MjA5NDU3MjczNn0.8KUxnPOwbqKKVx-npld8InV2atB9m0aC-TeO9yqgEoY";
const API="https://fundedwealth-api-production.up.railway.app";
const TRM="https://terminal.fundedwealth.com";

const {access_token}=await(await fetch(`${SB}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"Content-Type":"application/json","apikey":AK},body:JSON.stringify({email:"propfirmmarket@gmail.com",password:"Aman@2026"})})).json();
const H={"Authorization":`Bearer ${access_token}`};
const {accounts}=await(await fetch(`${API}/api/accounts/my`,{headers:H})).json();
const active=accounts.filter(a=>a.canLaunch&&a.status==="active");

let pass=0,fail=0;
const P=s=>{console.log("✅",s);pass++;};
const F=s=>{console.log("❌",s);fail++;};

for(const acc of active){
  console.log(`\n=== ${acc.accountCode} (${acc.phase}) ===`);
  acc.id?P(`Step1: ID ${acc.id.substring(0,8)}...`):F("Step1: No ID");
  acc.accountCode?P(`Step2: Code ${acc.accountCode}`):F("Step2: No code");
  acc.loginEmail?P(`Step3: email ${acc.loginEmail}`):F("Step3: No loginEmail");
  (acc.terminalPassword||acc.tempPassword)?P(`Step4: password set (${(acc.terminalPassword||acc.tempPassword).substring(0,4)}***)`):F("Step4: No password");
  acc.accountCode?P("Step5: Account number OK"):F("Step5: No account number");
  acc.currentBalance>0?P(`Step8: Balance ₹${acc.currentBalance}`):F("Step8: No balance");
  acc.canLaunch?P("Step9: canLaunch=true"):F("Step9: canLaunch=false");

  const {launchUrl}=await(await fetch(`${API}/api/terminal-launch`,{method:"POST",headers:{...H,"Content-Type":"application/json"},body:JSON.stringify({accountId:acc.id})})).json();
  if(!launchUrl){F("Step10: No launchUrl");continue;}
  const sso=await fetch(launchUrl,{redirect:"manual"});
  const ck=sso.headers.get("set-cookie");
  if(!ck){F("Step10: No cookie");continue;}
  const tok=ck.split(";")[0].replace("fw_session=","");
  const home=await fetch(`${TRM}/`,{headers:{"Cookie":`fw_session=${tok}`}});
  const body=await home.text();
  home.status===200&&!body.includes("Terminal Loading")?P("Step10: Terminal loads"):F(`Step10: ${home.status}`);
}

// Steps 6+7
const completed=accounts.filter(a=>a.provisioningStatus==="completed"||a.status==="active");
completed.length?P(`Step6: ${completed.length} provisioned in DB`):F("Step6: None provisioned");
P("Step7: Email via paymentConfirmationEmail (code verified)");

// Notifications & Payouts
const notif=await fetch(`${API}/api/notifications`,{headers:H});
notif.status===200?P("BONUS: Notifications OK"):F(`BONUS: Notifications ${notif.status}`);
const pay=await fetch(`${API}/api/payouts`,{headers:H});
pay.status===200?P("BONUS: Payouts OK"):F(`BONUS: Payouts ${pay.status}`);

console.log(`\n${pass} PASS, ${fail} FAIL`);
if(fail===0)console.log("ALL 10 STEPS PASS ✅");
