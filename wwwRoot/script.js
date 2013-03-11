(function(){

  function applySelect() {
    var getMethod = function (value) {
      return this.value !== value ? 'add': 'remove';
    }.bind(this);

    document.querySelector('.b').classList[getMethod('b')]('hidden');
    document.querySelector('.c').classList[getMethod('c')]('hidden');
    document.querySelector('.d').classList[getMethod('d')]('hidden');
  }

  document.querySelector('select[name="action"]').addEventListener('change', applySelect);
  // init
  applySelect.call(document.querySelector('select[name="action"]'));

}());