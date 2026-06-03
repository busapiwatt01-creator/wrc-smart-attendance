async function startCamera(){

const video =
document.getElementById(
'video'
);

try{

const stream =

await navigator
.mediaDevices
.getUserMedia({

video:{
facingMode:'user'
},

audio:false

});

video.srcObject =
stream;

}
catch(err){

alert(
'Camera Error'
);

console.log(err);

}

}

/* ======================= */

function distance(a,b){

let sum = 0;

for(let i=0;i<a.length;i++){

sum += Math.pow(
a[i]-b[i],
2
);

}

return Math.sqrt(sum);

}