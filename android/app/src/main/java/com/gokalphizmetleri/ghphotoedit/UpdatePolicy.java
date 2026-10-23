package com.gokalphizmetleri.ghphotoedit;
final class UpdatePolicy {
 static boolean shouldOffer(long current,long next,String version,String release,int minSdk,int deviceSdk){
  return next>current && version!=null && version.matches("[0-9]+\\.[0-9]+\\.[0-9]+(?:-[A-Za-z0-9.-]+)?") && version.length()<=32
   && release!=null && release.matches("https://github\\.com/GokalpHizmetleri/GHPhotoEdit/releases/tag/[A-Za-z0-9._-]+") && minSdk<=deviceSdk;
 }
}
