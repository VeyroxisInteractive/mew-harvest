package com.veyroxisinteractive.mewharvest;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.webkit.*;
import android.net.Uri;
import android.content.Intent;
import java.io.*;
import java.net.*;
import java.util.Collections;
import org.json.*;

public class MainActivity extends Activity {
 private WebView web;
 private boolean checking=false, showing=false;
 private long checkedAt=0;
 private static final String ORIGIN="appassets.androidplatform.net";
 private static final String REPO="VeyroxisInteractive/mew-harvest";
 private boolean local(Uri u){return "https".equals(u.getScheme())&&ORIGIN.equals(u.getHost())&&(u.getPort()==-1||u.getPort()==443)&&u.getPath()!=null&&u.getPath().startsWith("/assets/");}
 private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
 private WebResourceResponse asset(Uri u){
  if(!local(u))return missing();
  String path=u.getPath().substring(8);
  if(path.contains("..")||path.contains("\\")||path.indexOf('\0')>=0)return missing();
  try{
   String mime=URLConnection.guessContentTypeFromName(path);
   if(path.endsWith(".js"))mime="application/javascript";
   else if(path.endsWith(".css"))mime="text/css";
   else if(path.endsWith(".webp"))mime="image/webp";
   else if(path.endsWith(".json")||path.endsWith(".webmanifest"))mime="application/json";
   return new WebResourceResponse(mime==null?"application/octet-stream":mime,"UTF-8",getAssets().open(path));
  }catch(IOException e){return missing();}
 }
 @Override public void onCreate(Bundle state){
  super.onCreate(state);web=new WebView(this);web.setBackgroundColor(0xff376d36);
  web.setOnApplyWindowInsetsListener((v,i)->{v.setPadding(i.getSystemWindowInsetLeft(),i.getSystemWindowInsetTop(),i.getSystemWindowInsetRight(),i.getSystemWindowInsetBottom());return i;});
  setContentView(web);web.requestApplyInsets();WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setMediaPlaybackRequiresUserGesture(true);
  web.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){return asset(r.getUrl());}
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !local(r.getUrl());}
  });
  web.addJavascriptInterface(new UpdateBridge(),"MewAndroid");
  web.loadUrl("https://"+ORIGIN+"/assets/index.html");
 }
 public class UpdateBridge {
  @JavascriptInterface public String getVersion(){return BuildConfig.VERSION_NAME;}
  @JavascriptInterface public void checkForUpdates(){runOnUiThread(()->checkUpdate(true));}
 }
 private void message(String text){runOnUiThread(()->{if(!isFinishing()&&!isDestroyed())new AlertDialog.Builder(this).setTitle("Game updates").setMessage(text).setPositiveButton("OK",null).show();});}
 private void checkUpdate(boolean manual){
  if(checking){if(manual)android.widget.Toast.makeText(this,"Already checking…",0).show();return;}
  if(showing||(!manual&&System.currentTimeMillis()-checkedAt<60000))return;
  checking=true;checkedAt=System.currentTimeMillis();if(manual)android.widget.Toast.makeText(this,"Checking GitHub releases…",0).show();
  new Thread(()->{
   HttpURLConnection c=null;
   try{
    c=(HttpURLConnection)new URL("https://api.github.com/repos/"+REPO+"/releases/latest").openConnection();c.setConnectTimeout(6000);c.setReadTimeout(6000);c.setInstanceFollowRedirects(false);c.setRequestProperty("Accept","application/vnd.github+json");c.setRequestProperty("User-Agent","MEW-HARVEST-Android");
    int status=c.getResponseCode();if(status!=200){if(manual)message(status==404?"No published release is available yet.":"Update service unavailable. Please try later.");return;}
    ByteArrayOutputStream bytes=new ByteArrayOutputStream();try(InputStream in=c.getInputStream()){byte[] buf=new byte[4096];int n;while((n=in.read(buf))!=-1){if(bytes.size()+n>262144)throw new IOException();bytes.write(buf,0,n);}}
    JSONObject release=new JSONObject(bytes.toString("UTF-8"));String tag=release.optString("tag_name");
    if(release.optBoolean("draft")||release.optBoolean("prerelease")||!tag.matches("android-[0-9]{1,10}")){if(manual)message("No supported Android release is available.");return;}
    long remote=Long.parseLong(tag.substring(8));if(remote>2100000000L)throw new IOException();
    if(remote<=BuildConfig.VERSION_CODE){if(manual)message("You have the latest available version: "+BuildConfig.VERSION_NAME);return;}
    if(!manual&&getPreferences(MODE_PRIVATE).getLong("later-"+remote,0)>System.currentTimeMillis())return;
    String expected="https://github.com/"+REPO+"/releases/download/"+tag+"/MEW-HARVEST.apk";JSONArray assets=release.optJSONArray("assets");boolean found=false;
    if(assets!=null)for(int i=0;i<assets.length();i++){JSONObject a=assets.getJSONObject(i);if(a.optString("name").equals("MEW-HARVEST.apk")&&a.optLong("size")>0&&a.optString("browser_download_url").equals(expected))found=true;}
    if(!found){if(manual)message("The release does not have a downloadable APK yet.");return;}
    String name=release.optString("name",tag);
    runOnUiThread(()->{if(isFinishing()||isDestroyed())return;showing=true;new AlertDialog.Builder(this).setTitle("Update available").setMessage(name+"\n\nDownload the APK and open it to install."+(BuildConfig.DEBUG?"\nThis Test app is separate from the release app; progress does not transfer automatically.":"\nInstall over the existing release to retain progress."))
     .setPositiveButton("Download update",(d,w)->{try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(expected)));}catch(android.content.ActivityNotFoundException e){message("A browser is needed to download the update.");}})
     .setNegativeButton("Later",(d,w)->getPreferences(MODE_PRIVATE).edit().putLong("later-"+remote,System.currentTimeMillis()+21600000).apply()).setOnDismissListener(d->showing=false).show();});
   }catch(Exception e){if(manual)message("Could not check for updates. Check your internet connection and try again.");}
   finally{if(c!=null)c.disconnect();runOnUiThread(()->checking=false);}
  },"update-check").start();
 }
 @Override public void onBackPressed(){new AlertDialog.Builder(this).setMessage("Close MEW HARVEST?").setNegativeButton("Keep playing",null).setPositiveButton("Close",(d,w)->finish()).show();}
 @Override protected void onPause(){if(web!=null){web.evaluateJavascript("if(typeof saveGame==='function')saveGame();",null);web.onPause();}super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();checkUpdate(false);}}
 @Override protected void onDestroy(){if(web!=null)web.destroy();super.onDestroy();}
}
