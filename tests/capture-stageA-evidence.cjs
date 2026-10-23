const{chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');(async()=>{
const srv=http.createServer((q,s)=>{let p=path.join(process.cwd(),q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);if(fs.existsSync(p)&&fs.statSync(p).isFile()){s.setHeader('Content-Type',p.endsWith('.wasm')?'application/wasm':p.endsWith('.js')||p.endsWith('.mjs')?'text/javascript':p.endsWith('.html')?'text/html':'application/octet-stream');s.end(fs.readFileSync(p));}else{s.statusCode=404;s.end();}});
await new Promise(r=>srv.listen(8914,r));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:390,height:844}}),p=await c.newPage();
let errors=[];p.on('pageerror',e=>errors.push(String(e)));
await p.goto('http://127.0.0.1:8914');

// A. Scrolled-to-bottom reachability proof: curve + color panels at 320 and 390
await p.locator('#filePick').setInputFiles('demo.jpg');await p.waitForFunction(()=>state.bitmap);
for(const width of[320,390]){await p.setViewportSize({width,height:844});
 for(const tab of['curve','color','effects']){
  await p.locator('[data-tab='+tab+']').click();await p.waitForTimeout(500);
  // measure whether last control bottom is reachable above nav after scroll
  const reach=await p.evaluate(()=>{const body=document.querySelector('#panelBody');body.scrollTop=body.scrollHeight;
   const nav=document.querySelector('#tabs').getBoundingClientRect();
   const items=[...body.querySelectorAll('input,select,button,canvas')].filter(el=>el.getBoundingClientRect().height>0);
   const last=items[items.length-1].getBoundingClientRect();
   return{scrollable:body.scrollHeight>body.clientHeight,lastBottom:Math.round(last.bottom),navTop:Math.round(nav.top),clear:last.bottom<=nav.top};});
  await p.screenshot({path:'/downloads/GHPhotoEdit-scrolled-'+tab+'-'+width+'.png'});
  if(!reach.clear)throw Error(tab+' @'+width+' last control under nav: '+JSON.stringify(reach));
  console.log('scroll proof',tab,width,JSON.stringify(reach));
 }
}

// B. Real-photo grading + detail evidence (real Nikon portrait)
await p.setViewportSize({width:390,height:844});
await p.evaluate(()=>{state.bitmap=null;});
await p.locator('#filePick').setInputFiles('testdata/portrait.jpg');await p.waitForFunction(()=>state.bitmap);
await p.evaluate(()=>{state.params=defaultParams();
 // tasteful teal-shadow/warm-highlight grade + moderate sharpening, typical portrait edit
 state.params.cgSHue=195;state.params.cgSSat=48;state.params.cgHHue=40;state.params.cgHSat=40;state.params.cgMLum=10;
 state.params.sharpen=55;state.params.sharpenRadius=25;state.params.sharpenMask=40;state.params.noiseReduction=20;
 pushHistory();draw();});
await p.locator('[data-tab=color]').click();await p.waitForTimeout(500);
const shown=await p.evaluate(()=>[...document.querySelectorAll('#panelBody .slider-row')].map(r=>r.textContent).find(t=>t.includes('Shadows hue')));
if(!shown||!shown.includes('195'))throw Error('grading not applied in UI: '+shown);
await p.screenshot({path:'/downloads/GHPhotoEdit-portrait-grading-390.png'});
await p.locator('[data-tab=effects]').click();await p.waitForTimeout(500);
await p.screenshot({path:'/downloads/GHPhotoEdit-portrait-detail-390.png'});
// portrait grading on desktop width
await p.setViewportSize({width:1280,height:844});
await p.locator('[data-tab=color]').click();await p.waitForTimeout(500);
await p.screenshot({path:'/downloads/GHPhotoEdit-portrait-grading-1280.png'});

// C. Real-photo landscape (demo synthetic already covers color, but capture grading on demo too at 390 for reference)
await p.evaluate(()=>{state.bitmap=null;});
await p.locator('#filePick').setInputFiles('demo.jpg');await p.waitForFunction(()=>state.bitmap&&state.params.cgSHue===0);
console.log('errors:',JSON.stringify(errors));
if(errors.length)throw Error('page errors');
console.log('evidence capture PASS');await b.close();srv.close();})().catch(e=>{console.error(e);process.exit(1)});
