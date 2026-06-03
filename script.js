let faceMatcher;
let employeeData = [];

async function loadModels(){

await faceapi.nets.ssdMobilenetv1.loadFromUri(
'https://cdn.jsdelivr.net/npm/face-api.js/weights'
);

await faceapi.nets.faceRecognitionNet.loadFromUri(
'https://cdn.jsdelivr.net/npm/face-api.js/weights'
);

await faceapi.nets.faceLandmark68Net.loadFromUri(
'https://cdn.jsdelivr.net/npm/face-api.js/weights'
);

}

async function startCamera(){

const video = document.getElementById('video');

const stream = await navigator.mediaDevices.getUserMedia({
video:true
});

video.srcObject = stream;

return new Promise(resolve=>{
video.onloadedmetadata=()=>{
resolve();
};
});

}

async function getEmployees(){

const res = await fetch(
API_URL + '?action=getEmployees'
);

const data = await res.json();

employeeData = data.data;

return employeeData;

}

async function initRegister(){

await loadModels();

await startCamera();

const employees = await getEmployees();

const select = document.getElementById('employeeSelect');

select.innerHTML = '';

employees.forEach(emp=>{

const opt = document.createElement('option');

opt.value = emp.employeeId;

opt.textContent =
emp.employeeId + ' - ' + emp.name;

select.appendChild(opt);

});

fillEmployee();

select.addEventListener('change',fillEmployee);

document
.getElementById('saveBtn')
.addEventListener('click',saveFace);

document.getElementById('status').innerHTML =
'✅ AI Ready';

}

function fillEmployee(){

const id =
document.getElementById('employeeSelect').value;

const emp =
employeeData.find(x=>x.employeeId===id);

if(!emp) return;

document.getElementById('name').value =
emp.name;

document.getElementById('department').value =
emp.department;

document.getElementById('team').value =
emp.team;

document.getElementById('shift').value =
emp.shiftType;

}

async function saveFace(){

const video = document.getElementById('video');

const detection =
await faceapi
.detectSingleFace(video)
.withFaceLandmarks()
.withFaceDescriptor();

if(!detection){

alert('ไม่พบใบหน้า');

return;

}

const descriptor =
Array.from(detection.descriptor);

const employeeId =
document.getElementById('employeeSelect').value;

const res = await fetch(API_URL,{

method:'POST',

body:JSON.stringify({

action:'saveFace',

employeeId,

descriptor

})

});

const data = await res.json();

alert(data.message);

}

async function initScan(){

await loadModels();

await startCamera();

const employees = await getEmployees();

const labeled = [];

for(const emp of employees){

if(!emp.faceDescriptor) continue;

const descriptor =
JSON.parse(emp.faceDescriptor);

labeled.push(
new faceapi.LabeledFaceDescriptors(
emp.employeeId,
[
new Float32Array(descriptor)
]
)
);

}

faceMatcher =
new faceapi.FaceMatcher(labeled,.5);

document
.getElementById('scanBtn')
.addEventListener('click',scanFace);

}

async function scanFace(){

const resultBox =
document.getElementById('scanResult');

resultBox.innerHTML='Scanning...';

const video =
document.getElementById('video');

const detection =
await faceapi
.detectSingleFace(video)
.withFaceLandmarks()
.withFaceDescriptor();

if(!detection){

resultBox.innerHTML =
'❌ ไม่พบใบหน้า';

return;

}

const best =
faceMatcher.findBestMatch(
detection.descriptor
);

if(best.label==='unknown'){

resultBox.innerHTML =
'❌ ไม่พบข้อมูล';

return;

}

const emp =
employeeData.find(
x=>x.employeeId===best.label
);

const res = await fetch(API_URL,{

method:'POST',

body:JSON.stringify({

action:'scanAttendance',

employeeId:emp.employeeId

})

});

const data = await res.json();

resultBox.innerHTML = `
✅ ${emp.name}<br>
${emp.department}<br>
${data.scanType}<br>
${data.status}
`;

}

async function loadDashboard(){

const res = await fetch(
API_URL + '?action=getDashboard'
);

const data = await res.json();

document.getElementById('empCount').innerHTML =
data.summary.employees;

document.getElementById('scanCount').innerHTML =
data.summary.total;

document.getElementById('inCount').innerHTML =
data.summary.in;

document.getElementById('outCount').innerHTML =
data.summary.out;

const tbody =
document.getElementById('tableBody');

tbody.innerHTML='';

data.logs.forEach(log=>{

tbody.innerHTML += `
<tr>
<td>${log.date}</td>
<td>${log.time}</td>
<td>${log.employeeId}</td>
<td>${log.name}</td>
<td>${log.department}</td>
<td>${log.team}</td>
<td>${log.shift}</td>
<td>${log.scanType}</td>
<td>${log.status}</td>
</tr>
`;

});

const dept =
document.getElementById('filterDept');

dept.innerHTML =
'<option value="">All Department</option>';

data.departments.forEach(d=>{

dept.innerHTML += `
<option value="${d}">
${d}
</option>
`;

});

}