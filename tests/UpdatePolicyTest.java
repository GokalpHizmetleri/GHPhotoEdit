package com.gokalphizmetleri.ghphotoedit;
public class UpdatePolicyTest {
 static int count=0;static void check(boolean value,boolean expected){count++;if(value!=expected)throw new RuntimeException("Failed "+count);}
 public static void main(String[] args){String valid="https://github.com/GokalpHizmetleri/GHPhotoEdit/releases/tag/v0.1.2-preview";
 check(UpdatePolicy.shouldOffer(2,3,"0.1.2",valid,29,34),true);
 check(UpdatePolicy.shouldOffer(2,2,"0.1.1",valid,29,34),false);
 check(UpdatePolicy.shouldOffer(2,1,"0.1.0",valid,29,34),false);
 check(UpdatePolicy.shouldOffer(2,3,"0.1.2",valid,35,34),false);
 check(UpdatePolicy.shouldOffer(2,3,"0.1.2","https://evil.test/",29,34),false);
 check(UpdatePolicy.shouldOffer(2,3,"0.1.2",valid+"?redirect=evil",29,34),false);
 check(UpdatePolicy.shouldOffer(2,3,"0.1.2",valid.replace("https:","http:"),29,34),false);
 check(UpdatePolicy.shouldOffer(2,3,"0.1.2",valid.replace("github.com","github.com.evil.test"),29,34),false);
 check(UpdatePolicy.shouldOffer(2,3,"arbitrary text",valid,29,34),false);
 check(UpdatePolicy.shouldOffer(2,3,null,valid,29,34),false);
 System.out.println(count+" Java update policy tests PASS");}
}
