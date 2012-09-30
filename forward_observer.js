function loadingCell(target, loadingText){
  colspan = target.parents("table").find("thead th:visible").length
  if (colspan == 1 && cells.first().attr('colspan') != null){
    colspan = cells.first().attr('colspan') ;
  }
  
  
  if (colspan==0){ colspan = 1}
  loading=$j('<td>', {class: 'loading', colspan: colspan, html: $j('<h3>', {text: loadingText})});
  
  
  return loading
}
  
function loadingElement(target, loadingText, outsideTarget){
  loading = null;
    switch(target.prop('tagName')){
    case 'TR':
      if(outsideTarget == true){
        loading = $j('<tr>', {html: loadingCell(target, loadingText), class: 'loading'})
      }
      else{
        loading = loadingCell(target, loadingText)
      }  
      break;
    case 'SPAN':
      loading=$j('<span>', {class: 'loading', html: $j('<i>', {text: loadingText})});
      break;
    case 'LI':
      loading=$j('<li>', {class: 'loading', html: $j('<h2>', {text: loadingText})});
      break;      
    case 'TBODY':
      if(outsideTarget){
        loading = $j('<tbody>', {html: $j('<tr>', {html: loadingCell(target, loadingText)}), class: 'loading'})
      }
      else{
        loading = $j('<tr>', {html: loadingCell(target, loadingText), class: 'loading'})
      }
      break;
    case 'TFOOT':
      loading = $j('<tr>', {html: loadingCell(target, loadingText), class: 'loading'})
      break;
    default:
      loading=$j('<div>', {class: 'loading', html: $j('<h2>', {text: loadingText})});
    }  
  return loading;    
}

function loadingMessage(sourceElement) {
  
  
  loading=$j(sourceElement).data('loading')

  if (loading == null || loading == undefined){

    targetType =sourceElement.data('replace') || sourceElement.data('update') || sourceElement.data('append') || sourceElement.data('prepend') || sourceElement.data('before') || sourceElement.data('after')  || sourceElement.data('delete')
    target = $j('#'+targetType).first();
    
    loadingText = $j(sourceElement).data('loading-text') || "Loading..."
    loading =loadingElement(target, loadingText, (sourceElement.data('after') != null || sourceElement.data('before') != null));
  }

  return loading;
}



function doLoading(evt, xhr, status){
  message = loadingMessage($j(evt.target))
  
  if (message != 'none'){
    $j('#'+($j(evt.target).data('update') || $j(evt.target).data('replace') || $j(evt.target).data('delete') ) ).loading( message );
  }
}


$j(document).ready(function(){
  
  $j.fn.extend({loading: function loading(loading){
    $j(this).children().hide();
    $j(this).append(loading);
   }
  });
  
  $j('body').on('ajax:before','[data-update]', doLoading);
  
  $j('body').on('ajax:before','[data-delete]', function (evt, xhr, status){
    element=$j(this)
    if (element.data('loading-text')== null || element.data('loading') == null){
      element.data('loading-text', 'Deleting...')
    }
    doLoading(evt, xhr, status);
  });
  
  $j('body').on('ajax:complete', '[data-update]', function(evt, xhr, status){
    $j('#'+$j(evt.target).attr('data-update')).html(xhr.responseText);
  });

  $j('body').on('ajax:before','[data-append]', function (evt, xhr, status){
    element=$j(evt.target)
    $j('#'+element.data('append')).append(loadingMessage(element))
  });

  $j('body').on('ajax:before','[data-prepend]', function (evt, xhr, status){
    element=$j(evt.target)
    $j('#'+element.data('prepend')).prepend(loadingMessage(element))
  });

  $j('body').on('ajax:before','[data-before]', function (evt, xhr, status){
    element=$j(evt.target)
    $j(loadingMessage(element)).insertBefore('#'+element.data('before'))
  });

  $j('body').on('ajax:before','[data-after]', function (evt, xhr, status){
    e=$j(evt.target)
    element=loadingMessage(e)
    $j('#'+e.data('after')).after(element)
    element.show();
  });

  $j('body').on('ajax:complete', '[data-append]', function(evt, xhr, status){
    $j('#'+$j(evt.target).attr('data-append')+' .loading').remove();
    $j('#'+$j(evt.target).attr('data-append')).append(xhr.responseText).find("[data-focus]").focus();
  });

  $j('body').on('ajax:complete', '[data-prepend]', function(evt, xhr, status){
    $j('#'+$j(evt.target).attr('data-prepend')+' .loading').remove();
    $j('#'+$j(evt.target).attr('data-prepend')).prepend(xhr.responseText).find("[data-focus]").focus();

  });

  $j('body').on('ajax:complete', '[data-before]', function(evt, xhr, status){
    target=$j('#'+$j(evt.target).attr('data-before'));
    target.prev(target.prop('tagName')+'.loading').remove();
    $j(xhr.responseText).insertBefore(target);
  });

  $j('body').on('ajax:complete', '[data-after]', function(evt, xhr, status){
    source =$j(evt.target)
    target=$j('#'+source.data('after'));

    target.next(target.prop('tagName')+'.loading').remove();
    target.after(xhr.responseText);
  });
  
  
  $j('body').on('ajax:error', function(evt, xhr, status){
    $j.log(status);
  });
  
  // $j('body').on('ajax:success', function(evt, xhr, status){
  //   $j.log('hi');
  // });

  $j('body').on('ajax:before','[data-replace]',doLoading);
  
  $j('body').on('ajax:complete','[data-replace]', function(evt, xhr, status){ 

    element=$j('#'+$j(evt.target).attr('data-replace'))
    element.before(xhr.responseText);
    element.prev().find("[data-focus]").focus();
    element.remove();

  });

  $j('body').on('ajax:complete', 'a[data-method=delete], form[data-method=delete]', function(evt, xhr, status){ 
    $j('#'+$j(evt.target).attr('data-update')).remove();
  });
  
  $j('body').on('click', 'a[data-remove]', function(evt, xhr, status){ 
    $j('#'+$j(evt.target).data('remove')).remove();
    $j('#'+$j(this).data('remove')).remove();
    return false;
  });

  $j('body').on('click', 'a[data-handle-remote]', function(evt, xhr, status){ 
    $j.rails.handleRemote($j('#'+$j(evt.target).data('remove')))
    return false;
  });
  
  $j('body').on('click', 'a[data-alert]', function(evt, xhr, status){ 
    alert($j(this).data('alert'));
    return false;
  });
  
  $j('body').on('ajax:complete', 'a[data-delete], form[data-delete]', function(evt, xhr, status){
    $j('#'+$j(evt.target).attr('data-delete')).remove();
  });
  
  $j('body').on('click', 'a[data-replace][data-replace-with]', function(evt, xhr, status){
    $j('#'+$j(this).data('replace')).replaceWith($j(this).data('replace-with'))
    return false;
  });

  

  $j('body').on('click', 'a[data-popup]', function(evt, xhr, status){ 
    options=[];
    link=$j(this);
    if(link.data('height') != null)
      options.push("height="+link.data('height'));
    if(link.data('width') != null)
      options.push("width="+link.data('width'));
    if(link.data('scrollbars') != null)
      options.push("scrollbars="+link.data('scrollbars'));

    window.open(link.attr('href'), link.data('window-name'), options.join(','));
    return false;
  });

});