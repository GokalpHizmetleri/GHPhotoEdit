const{chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');(async()=>{
const srv=http.createServer((q,s)=>{let p=path.join(process.cwd(),q.url.split('?')[0]==='/'?'index.html':q.url.split('?')[0]);if(fs.existsSync(p)&&fs.statSync(p).isFile()){s.setHeader('Content-Type',p.endsWith('.html')?'text/html':p.endsWith('.js')?'text/javascript':'application/octet-stream');s.end(fs.readFileSync(p));}else{s.statusCode=404;s.end();}});
await new Promise(r=>srv.listen(8915,r));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:760,height:1000}})).newPage();
await p.goto('http://127.0.0.1:8915');
await p.locator('#filePick').setInputFiles('testdata/portrait.jpg');await p.waitForFunction(()=>state.bitmap);
await p.waitForTimeout(400);
const box=await p.locator('#gl').boundingBox();
await p.screenshot({path:'/tmp/ba-before.png',clip:box});
await p.evaluate(()=>{state.params.cgSHue=210;state.params.cgSSat=70;state.params.cgHHue=45;state.params.cgHSat=55;state.params.cgMLum=-8;state.params.sharpen=60;state.params.sharpenRadius=25;state.params.sharpenMask=40;state.params.noiseReduction=20;draw();});
await p.waitForTimeout(400);
await p.screenshot({path:'/tmp/ba-after.png',clip:box});
// pixel proof on the real photo itself
const px=await p.evaluate(()=>{const g=view.gl;const r=(x,y)=>{let o=new Uint8Array(4);g.readPixels(Math.floor(glCanvas.width*x),Math.floor(glCanvas.height*y),1,1,g.RGBA,g.UNSIGNED_BYTE,o);return [...o]};return{bg:r(0.1,0.15),skin:r(0.5,0.35)};});
console.log('after pixels',JSON.stringify(px));
await b.close();srv.close();})().catch(e=>{console.error(e);process.exit(1)});
