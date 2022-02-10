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
    localStorage.setItem('sqleditor_' + queryName, singleQuoteValue);
    //console.log('savebtn clicked,name: ' + queryName + ' value: ' + SQLValue);
  }
  populateSQLSelect();
});

//Delete SQL Button eventlistener
sqlDeleteBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const selected = localstoreSelect.value;
  if (selected !== '0') {
    const key = localstoreSelect.options[localstoreSelect.selectedIndex].text;
    localStorage.removeItem('sqleditor_' + key);
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
  } else {
    sqlDeleteBtn.classList.add('d-none');
  }
});

//Populate SQL Select
function populateSQLSelect() {
  const items = { ...localStorage };

  const options = Object.keys(items).map(function (key) {
    if (key.indexOf('sqleditor_') !== -1) {
      const onlyKey = key.replace('sqleditor_', '');
      return `<option value="${items[key]}">${onlyKey}</option>`;
    }
  });
  localstoreSelect.innerHTML = '<option value="0">Vælg gemt forespørgsel</option>' + options.join('');
  if (options.length > 0) {
    localstoreSelect.classList.replace('d-none', 'd-inline');
  } else {
    localstoreSelect.classList.replace('d-inline', 'd-none');
  }
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

//Load instructions from search params
function GetInstructionsFromUrlParams() {
  const urlParams = new URLSearchParams(location.search);
  const instruct = urlParams.get('instruct');
  //console.log(instruct);
  if (instruct && instruct !== '') {
    const decodedInstruct = UrlDecode(instruct);
    return decodedInstruct;
  } else {
    return false;
  }
}

function showInstructions() {
  const instructions = GetInstructionsFromUrlParams();
  if (instructions) {
    const instructionsModal = $('#LinkModal');
    instructionsModal.find('.modal-title').text('Instruktion');
    instructionsModal.find('.modal-body').text(instructions);
    instructionsModal.find('.modal-body').css('white-space', 'pre-wrap');
    instructionsModal.modal('show');
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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function () {
    alert('kopieret til udklipsholderen');
  })
    .catch(function (err) {
      console.error('Could not copy text: ', err);
    });
}




populateSQLSelect();
loadSqlFromUrlParams();
showInstructions();



//menulinks modalcontent on show
$('#LinkModal').on('show.bs.modal', function (event) {
  var DataObject = new zbcWebSQLInit();
  var menulink = $(event.relatedTarget) // Button that triggered the modal
  var datalink = menulink.data('link') // Extract info from data-* attributes
  var modal = $(this);
  var actionbtn = modal.find('#modalActionBtn');
  var modalBodyContent = '';
  switch (datalink) {
    //Link button
    case 'link':
      modal.find('.modal-title').text('Få et direkte link til denne forspørgsel')
      modalBodyContent = `<p>Du kan her få et direkte link til denne forespørsel, samt evt. skrive en kort instruktion, som vises når siden åbnes, ved klik på linket:</p>
      <label for="directLinkInput">Link:</label><a href="${getDirectLinkToThisUrl() + (GetInstructionsFromUrlParams() ? '&instruct=' + UrlEncode(GetInstructionsFromUrlParams()) : '')}" class="pull-right" id="openLinkToTest" target="_blank" title="Test dit link i en ny fane"><i class="fa fa-external-link"></i></a>
      <input type="text" id="directLinkInput" value="${getDirectLinkToThisUrl() + (GetInstructionsFromUrlParams() ? '&instruct=' + UrlEncode(GetInstructionsFromUrlParams()) : '')}" class="form-control">
      <label for="instructions">Instruktioner:</label>
      <textarea id="linkInstructions" class="form-control" rows="3">${GetInstructionsFromUrlParams() ? GetInstructionsFromUrlParams() : ''}</textarea>`;
      modal.find('.modal-body').html(modalBodyContent);
      var directLinkInput = modal.find('#directLinkInput');
      var openLinkToTest = modal.find('#openLinkToTest');
      linkInstructions = modal.find('#linkInstructions');
      linkInstructions.on('input', function () {
        if (linkInstructions.val().length < 1) {
          openLinkToTest.attr('href', getDirectLinkToThisUrl());
          directLinkInput.val(getDirectLinkToThisUrl());
        } else {
          openLinkToTest.attr('href', getDirectLinkToThisUrl() + '&instruct=' + UrlEncode(linkInstructions.val()));
          directLinkInput.val(getDirectLinkToThisUrl() + '&instruct=' + UrlEncode(linkInstructions.val()));
        }
      });
      actionbtn.text('Kopier link');
      actionbtn.on('click', function () {
        copyToClipboard(directLinkInput.val());
      });
      break;
    //import SQL Button
    case 'import':
      actionbtn.attr('disabled', true);
      modal.find('.modal-title').text('Importer data fra en SQL fil');
      modalBodyContent = `<p>Du kan her importere data fra en SQL fil, som du kan hente fra en anden server, eller som du har gemt tidligere:</p>
      <div class="custom-file">
        <input type="file" class="custom-file-input" id="sqlFileInput" accept=".sql">
        <label class="custom-file-label" for="sqlFileInput">Vælg SQL fil...</label>
        <div class="invalid-feedback">Vælg en fil.</div>
      </div>`;
      modal.find('.modal-body').html(modalBodyContent);
      const sqlFileInput = modal.find('#sqlFileInput');
      sqlFileInput.on('change', function () {
        if (sqlFileInput.val().length > 0) {
          modal.find('.invalid-feedback').hide();
          const file = sqlFileInput[0].files[0];
          let extension = file.name.split(".").pop();
          if (extension !== 'sql') {
            modal.find('.invalid-feedback').text('Vælg en .sql fil.');
            modal.find('.invalid-feedback').show();
          } else {
            //console.log(file);
            modal.find('.custom-file-label').text(file.name);
            actionbtn.attr('disabled', false);
          }
        }
      });
      actionbtn.text('Importer Data');
      actionbtn.on('click', function () {
        const warn = confirm(' Denne handling vil slette alt i de eksisterende tabeller! Er du sikke på at du vil fortsætte?');
        if (warn === false) {
          return false;
        }
        const file = sqlFileInput[0].files[0];
        let extension = file.name.split(".").pop();
        if (extension == 'sql') {
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = function (e) {
            const contents = e.target.result;
            let replacedContent = contents.replace(/&amp;/g, '&');
            DataObject.clearDatabase(function () {
              DataObject.zbcImportFromFile(replacedContent, function () {
                $('#divResultSQL').html("<div style='padding:10px;'>Data er importeret fra filen: " + file.name + "</div>");
              });
              DataObject.myDatabase();
            });
          };
          modal.modal('hide');
        }
      });
      break;
    //Download SQL Button
    case 'export':

      modal.find('.modal-title').text('Eksporter databasen som en SQL fil');
      modalBodyContent = `<p>Du kan her eksportere databasen som en SQL fil, som du kan indlæse senere:</p>
      <div class="row">
        <div class="col">
          <div class="form-group">
            <label for="exportWhatSelect">Eksporter</label>
            <select class="form-control" id="exportWhatSelect">
              <option value="all">Hele databasen</option>
              <option value="table">Enkelt Tabel</option>
            </select>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <div class="form-group" id="exportTableSelectGroup" style="display:none;">
            <label for="exportTableSelect">Tabel</label>
            <select class="form-control" id="exportTableSelect">
              
            </select>
          </div>
        </div>
      </div>`;
      modal.find('.modal-body').html(modalBodyContent);
      let exportWhatSelect = modal.find('#exportWhatSelect');
      let exportTableSelect = modal.find('#exportTableSelect');
      // populate the select with the table names
      var tableselectOptions = '';
      DataObject.getTableNames(function (data) {
        //console.log(data);
        for (var i = 0; i < data.length; i++) {
          tableselectOptions += `<option>${data[i]}</option>`;
        }
        exportTableSelect.html(tableselectOptions);
      });

      let exportTableSelectGroup = modal.find('#exportTableSelectGroup');
      exportWhatSelect.on('change', function () {
        if (exportWhatSelect.val() == 'table') {
          exportTableSelectGroup.show();
        } else {
          exportTableSelectGroup.hide();
        }
      });
      actionbtn.text('Download');
      actionbtn.on('click', function () {

        let config = {
          database: 'zbcSchoolsDemoDatabase',
          linebreaks: true,
          success: function (sql) {
            var filename;
            if (exportWhatSelect.val() == 'table') {
              filename = exportTableSelect.val() + '.sql';
            } else {
              filename = 'zbcSchoolsDemoDatabase.sql';
            }
            var file = new File([sql], filename, { type: "text/plain;charset=utf-8" });
            saveAs(file);
          },
          error: function (msg) {
            alert(msg);
          }
        };
        if (exportWhatSelect.val() == 'table') {
          config.table = exportTableSelect.val();
        }
        websqldump.export(config);
        modal.modal('hide');
      });
      break;
  }
})

//menulinks modalcontent on hidden
$('#LinkModal').on('hidden.bs.modal', function (e) {
  var modal = $(this)
  modal.find('.modal-title').text('');
  modal.find('.modal-body').text('');
  modal.find('.modal-body').css('white-space', 'initial');
  modal.find('#modalActionBtn').text('');
  modal.find('#modalActionBtn').off();
  modal.find('#modalActionBtn').attr('disabled', false);
  // do something...
})