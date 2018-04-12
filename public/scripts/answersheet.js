$ = jQuery

function updateTextInput(val) {
  $('#question3 #indicator').text(val+"元");
}

$(window).on('load',function(){
  $('#inform').modal('show');
});

$(document).ready(() => {
  current = 0;
  fadespeed = 800;
  updateTextInput(0);
  $('#question0').fadeIn(fadespeed, () => {
    $('.next').click((form) => {
      $('#question'+String(current)+' .opt').parsley().whenValidate().done(() => {
        if(current != 3){
          form.preventDefault();
          $('#question'+String(current)).fadeToggle(fadespeed, () => {
            $('#question'+String(current+1)).fadeToggle(fadespeed, () => {
              current += 1
            });
          });
        };
      }).fail(() => {
        form.preventDefault();
      })
    });
  });

})
