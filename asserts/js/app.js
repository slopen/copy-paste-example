define ([

    "jquery",
    "underscore",
    "backbone"

], function ($, _, Backbone) {

  return function ($element){

    // model for item in table
    var itemModel = Backbone.Model;

    // view for item in table
    var itemView = Backbone.View.extend({

        tagName: 'tr',

        events: {
          "text:paste": "paste"
        },

        // get template from page
        template: $('#item-template').html(),

        initialize: function(){
          _(this).bindAll('render');

          this.model.bind("change", this.render);
        },

        render: function(){
          var data = this.model.toJSON();

          // compile template and draw it
          this.$el.html( 
            $(_.template( this.template, {data: data}) ) 
          );

          return this;
        },

        paste: function(e){
          var selection = e.selection;

          console.log('pasted:', 'start', selection.range.start, 'end', selection.range.end);

          this.model.set({
            content: selection.text
          });
        }
    });


    // collection for items list
    var collectionModel = Backbone.Collection.extend({
      model: itemModel
    });

    // collection view for items list
    var collectionView = Backbone.View.extend({

        initialize: function(){

            _(this).bindAll('render');

            // render on reset
            this.collection.bind('reset', this.render);
        },

        render: function(){

          // prepare document fragment
          var fragment = document.createDocumentFragment();

          // populating document fragment
          this.collection.each(function (model){
            fragment.appendChild(

              // rendering model view
              new itemView({ 
                model: model
              }).render().el 

            );
          });

          // finally insert fragment
          this.$el.find('table > tbody') [0].appendChild(fragment);
        }

    });


    // module 
    var app = {

      events: {

        // show context menu
        "contextmenu .text-panel": function (e){
          var selection = this.getSelection();

          if (selection.text){
            var $contextMenu = $('#context-menu');

            $contextMenu
              .addClass('active')
              .css({
                left: e.pageX,
                top: e.pageY
              });
          }

          return false;
        },

        // context menu action click
        "click #context-menu a": function (e){
          var selection = this.selection = this.getSelection(),
              $contextMenu = $('#context-menu').removeClass('active');

          // selection text tooltip
          $('#selection-text')
            .css({
                left: e.pageX,
                top: e.pageY
            })
            .addClass('active')
            .text(selection.text);

          // watch for mouse position
          $(document).on('mousemove', _.bind(function(){
            this.dragSelection.apply(this, arguments);
          }, this));

          return false;
        },

        // paste into cell by click
        "click .table-panel td": function(e){

          if (this.selection) {
            var $element = $(e.currentTarget);

            $element.trigger($.Event('text:paste', {
              selection: this.selection
            }));

            this.selection = null;
            this.undoModel = $(e.currentTarget).attr('data-model');

            $('#selection-text').removeClass('active');

            $(document).off('mousemove');
          }

        }

      },

      bindEvents: function () {
        var evtName, selector, callback;

        // attaching callbacks on app events
        for (var title in this.events){

          evtName = title.slice(0, title.indexOf(' '));
          selector = title.slice(title.indexOf(' '));
          callback = this.events [title];

          this.$el.on(evtName, selector, _.bind(callback, this));
        }

      },

      start: function ($element){
        this.$el = $element;

        // binding application events
        this.bindEvents();

        // bind undo action
        $(document).on('keyup', _.bind(function(e){

          if(e.which == 27){
            this.undo();
          }

        }, this));   



        // creating collection
        this.collection = new collectionModel();

        // creating collection view
        this.itemsListView = new collectionView({
          el: $element.find('.table-panel') [0],
          collection: this.collection
        });

        // populate with initial mock data
        this.collection.reset([
          {id:1},{id:2},{id:3},{id:4},{id:5},{id:6},{id:7},{id:8},{id:9},{id:10} 
        ]);


        // initialization finished
        console.log('Application started', this);

        return this;
      },      


      // helper functions 

      // get selection from page
      getSelection: function(){
        var selection;

        // different browsers issues
        switch (true){

          case !!window.getSelection: 
            selection = window.getSelection();
            break;

          case !!document.getSelection: 
            selection = document.getSelection();
            break;

          case !!document.selection: 
            selection = document.selection.createRange().text;
            break;
        }

        // produce app.selection obj
        return {
          text: selection.toString(),
          range:{
            start: selection.getRangeAt(0).startOffset,
            end: selection.getRangeAt(0).endOffset
          }
        };  

      },

      // seletion tooltip follows the cursor
      dragSelection: _.throttle(_.bind(function(e){
        var $selectionText = $('#selection-text');

        $selectionText
          .css({
              left: e.pageX + 5,
              top: e.pageY + 5
          });

      }, this), 200 /* update position once per every 200ms */),

      // undo last action on ESC pressed
      undo: function(){

        if (this.undoModel){
          var undoModel = this.collection.get(this.undoModel);

          undoModel.set({
            content: undoModel.previous('content') || ''
          });

          this.selection = this.undoModel = null;

          $('#context-menu, #selection-text').removeClass('active');
        }
      }

    };

    // init with element provided
    return app.start($element);

  };

}); 