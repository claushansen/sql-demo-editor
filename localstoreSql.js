const localstoreSelect = document.querySelector('#localstoreSelect');
const sqlSaveBtn = document.querySelector('#sqlSaveBtn');
const sqlDeleteBtn = document.querySelector('#sqlDeleteBtn');

//Save button eventlistener
sqlSaveBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const SQLValue = window.editor.getValue();
  const singleQuoteValue = SQLValue.replace(/"/g, "'");
  const queryName = prompt('Giv din forespørgsel et navn');
  if (queryName) {
    localStorage.setItem('sqleditor_'+ queryName, singleQuoteValue);
    //console.log('savebtn clicked,name: ' + queryName + ' value: ' + SQLValue);
  }
  populateSQLSelect();
});

//Delete SQL Button eventlistener
sqlDeleteBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const selected = localstoreSelect.value;
  if (selected !== '0') {
    const key= localstoreSelect.options[localstoreSelect.selectedIndex].text;
    localStorage.removeItem('sqleditor_'+key);
    //console.log('denne key er fjernet: ' + key);
    sqlDeleteBtn.classList.add('d-none');
  }
  populateSQLSelect();
});

//Select eventListener
localstoreSelect.addEventListener('change', function (e) {
  e.preventDefault();
  const selected = localstoreSelect.value;
  if (selected !== '0') {
    sqlDeleteBtn.classList.remove('d-none');
    window.editor.setValue(selected);
    //console.log('localstoreSelect changed value: ' + selected);
  }else {
    sqlDeleteBtn.classList.add('d-none');
  }
});

//Populate SQL Select
function populateSQLSelect() {
  const items = { ...localStorage };
  
  const options = Object.keys(items).map(function (key) {
    if(key.indexOf('sqleditor_') !== -1) {
    const onlyKey = key.replace('sqleditor_', '');
    return `<option value="${items[key]}">${onlyKey}</option>`;
    }
  });
  localstoreSelect.innerHTML = '<option value="0">Vælg gemt forespørgsel</option>' + options.join('');
}

//Load sql from search params
function loadSqlFromUrlParams() {
    const urlParams = new URLSearchParams(location.search);
    const sql = urlParams.get('sql');
  if (sql) {
    const decodedSql = UrlDecode(sql);
    window.editor.setValue(decodedSql);
  }
}

//decode URL encoded string
function UrlDecode(url) {
  return decodeURIComponent(url.replace(/\+/g, ' '));
}

//encoded URL string
function UrlEncode(url) {
  return encodeURIComponent(url).replace(/%20/g, '+');
}

function getDirectLinkToThisUrl() {
  const location = window.location.href;
  const url = location.split('?')[0];
  const sql = window.editor.getValue();
  const encodedSql = UrlEncode(sql);
  const newUrl = url.replace(/\?.*/, '') + '?sql=' + encodedSql;
  return newUrl;
}

//is page loaded in iframe
function isIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function exportDbToLog() {
  websqldump.export({
    database: 'zbcSchoolsDemoDatabase',
    linebreaks: true
  });
}
//console.log('Iframe:'+isIframe());

populateSQLSelect();
loadSqlFromUrlParams();