const listNotes = function(userNotes) {
  userNotes.onSnapshot(function(snapshot){
    let oldList = document.getElementById('index');
    if (oldList) {
      document.body.removeChild(oldList);
    }

    let list = document.createElement('ul');
    list.id = 'index';
    document.body.prepend(list);

    snapshot.forEach(function(_child){
      var note_id = _child.id;
      var r = Math.floor(Math.random()*1000000);
      var li = document.createElement('li');
      li.innerHTML = `<li>
          <a href="/#${note_id}" onclick="setTimeout(location.reload.bind(location), 1)">${note_id}<a/>
          <span>  </span>[ <a id='delete${r}' note='${note_id}' href='#'>X<a/> ]
        </li>`;
      list.appendChild(li);
      li.querySelector(`#delete${r}`).addEventListener('click', function() {
        let note = this.getAttribute('note');
        l(note);
        userNotes.doc(note).delete()
          .then(function() {
            l("Remove succeeded.")
          })
          .catch(function(error) {
            l("Remove failed: " + error.message)
          });
      });
    });
  });
}
