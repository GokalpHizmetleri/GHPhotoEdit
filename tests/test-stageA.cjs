const{chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');(async()=>{
const srv=http.createServer((q,s)=>{let p=path.join(process.cwd(),q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);if(fs.existsSync(p)&&fs.statSync(p).isFile()){s.setHeader('Content-Type',p.endsWith('.wasm')?'application/wasm':p.endsWith('.js')||p.endsWith('.mjs')?'text/javascript':p.endsWith('.html')?'text/html':'application/octet-stream');s.end(fs.readFileSync(p));}else{s.statusCode=404;s.end();}});
await new Promise(r=>srv.listen(8913,r));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
let c=await b.newContext({viewport:{width:390,height:844}}),p=await c.newPage();
let errors=[],requests=[];p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>requests.push(r.url()));
await p.goto('http://127.0.0.1:8913');
await p.locator('#filePick').setInputFiles('demo.jpg');await p.waitForFunction(()=>state.bitmap);

// 1. Curve pixel effect + identity baseline
const curve=await p.evaluate(()=>{
 const px=()=>{let out=new Uint8Array(4);view.gl.readPixels(Math.floor(glCanvas.width/2),Math.floor(glCanvas.height/2),1,1,view.gl.RGBA,view.gl.UNSIGNED_BYTE,out);return Array.from(out);};
 draw();const before=px();
 state.curves.rgb=[[0,0],[0.5,0.95],[1,1]];draw();const lifted=px();
 state.curves.rgb=[[0,0],[0.5,0.05],[1,1]];draw();const darkened=px();
 state.curves.r=[[0,0],[0.5,1],[1,1]];draw();const redUp=px();
 state.curves=defaultCurves();draw();const restored=px();
 if(!(lifted[0]>before[0]+10))throw Error('curve lift '+before+'->'+lifted);
 if(!(darkened[0]<before[0]-10))throw Error('curve darken');
 if(!(redUp[0]>before[0]+5))throw Error('channel curve');
 if(Math.abs(restored[0]-before[0])>1)throw Error('curve identity restore '+before+' '+restored);
 return{before,lifted,darkened};
});
console.log('curve pixels PASS',curve);

// 2. Curve undo + draft restore
await p.evaluate(()=>{state.curves.rgb=[[0,0],[0.5,0.9],[1,1]];pushHistory();draw();});
await p.locator('#btnUndo').click();
let idOk=await p.evaluate(()=>!curveActive());
if(!idOk)throw Error('curve undo');
await p.locator('#btnRedo').click();
await p.locator('[data-tab=library]').click();
await p.locator('#saveName').fill('Curve draft');
await p.getByRole('button',{name:'Save draft',exact:true}).click();
await p.waitForFunction(async()=>(await readAll('drafts')).length===1);
await p.reload();await p.locator('#btnDrafts').click();
await p.getByRole('button',{name:'Open',exact:true}).click();
await p.waitForFunction(()=>state.bitmap&&state.curves&&state.curves.rgb.length===3);
console.log('curve draft/undo/redo PASS');

// 3. Detail + grading pixels
const fx=await p.evaluate(()=>{
 state.curves=defaultCurves();
 const px=(fx,fy)=>{let out=new Uint8Array(4);view.gl.readPixels(Math.floor(glCanvas.width*fx),Math.floor(glCanvas.height*fy),1,1,view.gl.RGBA,view.gl.UNSIGNED_BYTE,out);return Array.from(out);};
 state.params=defaultParams();draw();const base=px(0.133,0.265),baseC=px(0.5,0.5);
 state.params.sharpen=90;state.params.sharpenRadius=40;draw();const sharp=px();
 state.params=defaultParams();state.params.noiseReduction=90;draw();const nr=px();
 state.params=defaultParams();state.params.cgSHue=210;state.params.cgSSat=80;state.params.cgMLum=-40;draw();const grad=px(0.5,0.5);
 const diff=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
 if(diff(base,sharp)<3)throw Error('sharpen no-op');
 if(diff(baseC,grad)<8)throw Error('grading no-op '+baseC+' '+grad);
 return{base,sharp,nr,grad};
});
console.log('detail/grading pixels PASS',fx);

// 4. Turkish language switch and back
await p.locator('[data-tab=library]').click();
await p.locator('#langSel').selectOption('tr');
await p.waitForFunction(()=>document.querySelector('[data-tab=library]').textContent.includes('Kitaplık'));
const trOk=await p.evaluate(()=>document.querySelector('[data-tab=faces]').textContent.includes('Yüzler')&&document.querySelector('#btnExport').textContent==='Dışa aktar');
if(!trOk)throw Error('tr tabs');
await p.locator('#langSel').selectOption('en');
await p.waitForFunction(()=>document.querySelector('[data-tab=library]').textContent.includes('Library'));
console.log('language switch PASS');

// 5. Draft export/import roundtrip
await p.evaluate(()=>{state.curves.rgb=[[0,0],[0.4,0.8],[1,1]];pushHistory();draw();});
await p.locator('[data-tab=library]').click();
await p.locator('#saveName').fill('Backup test');
await p.getByRole('button',{name:'Save draft',exact:true}).click();
await p.waitForFunction(async()=>(await readAll('drafts')).length===2);
const dl=p.waitForEvent('download');
await p.getByRole('button',{name:'Export drafts',exact:true}).click();
const d=await dl;const fp='/tmp/gh-drafts.json';await d.saveAs(fp);
const parsed=JSON.parse(fs.readFileSync(fp,'utf8'));
if(parsed.kind!=='draft-backup'||parsed.drafts.length!==2)throw Error('backup content');
await p.locator('#fileDrafts').setInputFiles(fp);
await p.waitForFunction(async()=>(await readAll('drafts')).length===4);
await p.waitForTimeout(400);
const restored=await p.evaluate(async()=>{const all=await readAll('drafts');const matches=all.filter(x=>x.name==='Backup test');if(matches.length!==2)return 'count:'+all.map(x=>x.name).join('|');try{return matches.every(d=>JSON.parse(d.edit).cv.rgb.length===3&&d.photo&&d.photo.size>1000&&d.thumb)?'OK':'content bad';}catch(e){return 'parse:'+e;}});
console.log('restored check:',restored);
if(restored!=='OK')throw Error('import curve restore '+restored);
console.log('draft export/import PASS');

// 6. Histogram data present and curve canvas drawn
await p.locator('[data-tab=curve]').click();
await p.waitForTimeout(600);
const histOk=await p.evaluate(()=>{const h=histData();return h&&h[0].reduce((a,b)=>a+b,0)>1000&&document.querySelector('#curveCanvas');});
if(!histOk)throw Error('histogram');
// simulate curve drag via pointer events on the canvas
const box=await p.locator('#curveCanvas').boundingBox();
await p.mouse.move(box.x+box.width*0.5,box.y+box.height*0.7);
await p.mouse.down();await p.mouse.move(box.x+box.width*0.5,box.y+box.height*0.25,{steps:6});await p.mouse.up();
const dragged=await p.evaluate(()=>state.curves.rgb.some((pt,i)=>i>0&&i<state.curves.rgb.length-1&&pt[1]>0.6));
if(!dragged)throw Error('curve pointer drag');
console.log('histogram + curve canvas drag PASS');

// 7. Layout screenshots
for(const width of[320,390,1280]){await p.setViewportSize({width,height:844});
 for(const tab of['curve','detail','grading','library']){await p.locator('[data-tab='+tab+']').click();await p.waitForTimeout(400);await p.screenshot({path:'/downloads/GHPhotoEdit-stageA-'+tab+'-'+width+'.png'});}}
console.log({errors,offOrigin:requests.filter(u=>!u.startsWith('http://127.0.0.1:8913'))});
await b.close();srv.close();if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
