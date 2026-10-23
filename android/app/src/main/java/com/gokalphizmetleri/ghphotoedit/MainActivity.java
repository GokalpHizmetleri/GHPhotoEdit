package com.gokalphizmetleri.ghphotoedit;
import android.app.*;
import android.os.*;
import android.webkit.*;
import android.content.*;
import android.net.Uri;
import android.provider.MediaStore;
import android.widget.Toast;
import android.util.Base64;
import java.io.OutputStream;
public class MainActivity extends Activity {
 private WebView web;
 private ValueCallback<Uri[]> chooser;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  getWindow().setStatusBarColor(0xff14161a);getWindow().setNavigationBarColor(0xff14161a);
  web=new WebView(this);setContentView(web);
  WebSettings settings=web.getSettings();settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(true);settings.setAllowContentAccess(true);
  settings.setAllowFileAccessFromFileURLs(false);settings.setAllowUniversalAccessFromFileURLs(false);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return true;}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){
    if(chooser!=null)chooser.onReceiveValue(null);chooser=callback;
    Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("image/*");
    try{startActivityForResult(i,10);}catch(Exception e){chooser.onReceiveValue(null);chooser=null;}
    return true;
   }
  });
  web.addJavascriptInterface(new Object(){
   @JavascriptInterface public void saveImage(String encoded,String ignored){
    new Thread(()->{
     Uri uri=null;
     try{
      byte[] data=Base64.decode(encoded,Base64.DEFAULT);
      ContentValues values=new ContentValues();values.put(MediaStore.Images.Media.DISPLAY_NAME,"GHPhotoEdit-"+System.currentTimeMillis()+".jpg");
      values.put(MediaStore.Images.Media.MIME_TYPE,"image/jpeg");values.put(MediaStore.Images.Media.RELATIVE_PATH,"Pictures/GHPhotoEdit");values.put(MediaStore.Images.Media.IS_PENDING,1);
      uri=getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI,values);
      if(uri==null)throw new Exception("No media uri");
      try(OutputStream out=getContentResolver().openOutputStream(uri)){if(out==null)throw new Exception("No stream");out.write(data);}
      values.clear();values.put(MediaStore.Images.Media.IS_PENDING,0);getContentResolver().update(uri,values,null,null);
      runOnUiThread(()->Toast.makeText(MainActivity.this,"Saved to Pictures/GHPhotoEdit",Toast.LENGTH_LONG).show());
     }catch(Exception e){if(uri!=null)getContentResolver().delete(uri,null,null);runOnUiThread(()->Toast.makeText(MainActivity.this,"Could not save photo",Toast.LENGTH_LONG).show());}
    }).start();
   }
  },"GH");
  web.loadUrl("file:///android_asset/index.html");
 }
 @Override protected void onActivityResult(int req,int result,Intent data){super.onActivityResult(req,result,data);if(req==10&&chooser!=null){chooser.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);chooser=null;}}
 @Override public void onBackPressed(){web.evaluateJavascript("document.getElementById('landing').style.display='flex'",null);}
 @Override protected void onDestroy(){web.removeJavascriptInterface("GH");web.destroy();super.onDestroy();}
}
