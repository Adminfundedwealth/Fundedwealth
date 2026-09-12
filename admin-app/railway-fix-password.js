const {createClient}=require('@supabase/supabase-js');
const sb=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
const EMAIL='propfirmmarket@gmail.com';
const PWD='FW2026Temp99';
sb.auth.admin.listUsers({perPage:1000}).then(function(r){
  var u=r.data.users.find(function(x){return x.email===EMAIL;});
  if(u===undefined){console.log('NOT FOUND');return;}
  console.log('FOUND:'+u.id);
  sb.auth.admin.updateUserById(u.id,{password:PWD,email_confirm:true}).then(function(r2){
    if(r2.error){console.log('ERR:'+r2.error.message);}
    else{console.log('PASSWORD SET TO: '+PWD);}
  });
});
