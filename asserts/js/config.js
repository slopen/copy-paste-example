require.config({
  paths: {

    'jquery'                : 'https://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min',
    'underscore'            : 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.2.1/lodash.compat.min',
    'backbone'              : 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone-min',

    // application core
    'app'                   : 'app'
  },

  shim: {
      'backbone': {
          deps: ['underscore', 'jquery'],
          exports: 'Backbone'
      }
  }  

});

var deps = [

    // application
    'app', 

    // libs
    'jquery',
    'underscore',
    'backbone'

];

require (deps, function (app, $) {

  // document ready confirm
  $(function(){

    // launching
    window.application = app ( $('#main') );  

  })

});