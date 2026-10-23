import{FaceLandmarker,FilesetResolver}from './vendor/vision_bundle.mjs';
let model;
addEventListener('message',async e=>{if(e.source!==parent||e.data?.kind!=='detect')return;const{id,bitmap}=e.data;try{model??=await FaceLandmarker.createFromOptions(await FilesetResolver.forVisionTasks('./vendor/wasm'),{baseOptions:{modelAssetPath:'./vendor/face_landmarker.task',delegate:'CPU'},runningMode:'IMAGE',numFaces:3,outputFaceBlendshapes:false});const result=model.detect(bitmap);parent.postMessage({kind:'faces',id,faces:result.faceLandmarks},'*');}catch(err){parent.postMessage({kind:'faces',id,error:String(err)},'*');}finally{bitmap?.close();}});
parent.postMessage({kind:'face-ready'},'*');
