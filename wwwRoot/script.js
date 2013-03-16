(function(){

  function applySelect() {
    var getMethod = function (value) {
      return this.value !== value ? 'add': 'remove';
    }.bind(this);

    document.querySelector('.b').classList[getMethod('b')]('hidden');
    document.querySelector('.c').classList[getMethod('c')]('hidden');
    document.querySelector('.d').classList[getMethod('d')]('hidden');
  }

  document.querySelector('select[name="action"]')
    .addEventListener('change', applySelect);

  // init
  applySelect.call(document.querySelector('select[name="action"]'));


  function rebuildList(actions){
    var listEl = document.getElementById('list');
    var forms = listEl.querySelectorAll('form');
    [].forEach.call(forms, function(form) {
      listEl.removeChild(form);
    });
    actions.forEach(function(action) {

      var html =
        '<form method="POST" enctype="multipart/form-data" class="row">' +
        ' <input type="hidden" name="id" value="{{id}}" />' +
        ' <span class="action">{{action}}</span>' +
        ' <span class="method">{{method}}</span>' +
        ' <span class="url">{{url}}</span>' +
        ' <input type="submit" class="deleteBtn" value="delete" />' +
        '</form>';

      html = html.replace(/\{\{(.*?)\}\}/g, function(_, key) {
        return action[key];
      });

      listEl.insertAdjacentHTML('beforeend', html);
    })
  }

  function clearDetail() {
    var selectors = [
      '#detail input[name="method"]',
      '#detail input[name="url"]',
      '#detail select[name="action"]',
      '#detail input[name="statusCode"]',
      '#detail textarea[name="headers"]',
      '#detail textarea[name="body"]',
      '#detail input[name="delay"]'];

    selectors.forEach(function(selector) {
      document.querySelector(selector).value = '';
    });

    applySelect.call(document.querySelector('select[name="action"]'));
  }

  var forms = document.querySelectorAll('form');
  [].forEach.call(forms, function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var formData = new FormData(form);
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('readystatechange', function() {
        if (xhr.readyState !== xhr.DONE) { return; }
        // we are asuming everything worked
        var actions = JSON.parse(xhr.responseText);
        rebuildList(actions);
        clearDetail();
      });
      xhr.open('POST', '/rules');
      xhr.send(formData);

    });
  });

}());