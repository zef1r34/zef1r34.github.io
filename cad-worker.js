'use strict';
// STEP content stays inside this worker. Only the CAD runtime is fetched.
self.onmessage=async event=>{
  try{
    self.postMessage({status:'Читаю STEP в отдельном потоке…'});
    importScripts('./occt-import-js.js');
    const occt=await occtimportjs({locateFile:name=>new URL(name,self.location.href).href});
    const result=occt.ReadStepFile(new Uint8Array(event.data.buffer),{linearUnit:'millimeter',linearDeflectionType:'bounding_box_ratio',linearDeflection:.001,angularDeflection:.4});
    if(result.meshes?.reduce((sum,m)=>sum+m.index.array.length/3,0)>1500000)throw Error('STEP содержит больше 1,5 млн треугольников. Экспортируйте облегчённую копию.');
    self.postMessage({result});
  }catch(error){self.postMessage({error:error.message||'Не удалось прочитать STEP.'});}
};
