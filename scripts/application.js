/**
 * @license LearningManagement v1.0.0
 * (c) 2016 Giancarlo Trevisan
 * License: MIT
 */
 var db = JSON.parse(localStorage.getItem('db')) || {}; // TODO: mongodb

(function() {
    'use strict';
    var app = angular.module('application', []);

    var schema = [
      { class: 'courses', subclass: 'course', name: 'Programmi', icon: 'fa-code-fork', types: [] },
      { class: 'people', subclass: 'person', name: 'Rubrica', icon: 'fa-book', types: [
        { code: 'P', name: 'Persona' },
        { code: 'C', name: 'Azienda' }
      ] },
      { class: 'groups', subclass: 'group', name: 'Gruppi', icon: 'fa-users', types: [] },
      { class: 'events', subclass: 'event', name: 'Agenda', icon: 'fa-calendar-o', types: [
        { code: 'A', name: 'Appuntamento' },
        { code: 'S', name: 'Seminario' },
        { code: 'T', name: 'Assistenza' },
        { code: 'C', name: 'Corso' },
        { code: 'W', name: 'Workshop' }
      ] },
      { class: 'searches', subclass: 'search', name: 'Consultazioni', icon: 'fa-search' },
      { class: 'trash', subclass: 'trash', name: 'Cestino', icon: 'fa-trash' }
    ];
    schema.forEach(function(element) {
      if (!db.index)
        db.index = {};
      if (!db[element.class])
        db[element.class] = new Array();
    });

    app.directive('navigation', function() {
      return {
        restrict: 'E',
        templateUrl: 'views/navigation.htm',
        controller: function () {
          this.db = db;
          this.options = schema;
        },
        controllerAs: 'navigation'
      };
    });
    schema.forEach(function(element) {
        app.directive(element.class, function () {
          return {
            restrict: 'E',
            templateUrl: 'views/' + element.class + '.htm',
            controller: function () {
              this.name = element.name;
              this.showAs = 'table';
              this.data = db[element.class];
              this.selected = null;

              // CRUD functions
              this.create = function(detail) {
                if (detail) {
                  if (!this.selected[detail])
                      this.selected[detail] = [];
                  this.selected[detail].unshift({ _id: generateUUID() });
                } else {
                  this.data.unshift({ _id: generateUUID() });
                  this.selected = this.data[0];
                }
                db.index[this.data[0]._id] = this.data[0];
              };
              this.read = function(id) {

              };
              this.update = function() {
                var that = this;

                if (document.getElementById(element.subclass + '_image').files.length) {
                  var reader = new FileReader();
                  reader.onload = function() {
                    that.selected.image = reader.result;
                    localStorage.setItem('db', JSON.stringify(db));
                  };
                  reader.readAsDataURL(document.getElementById(element.subclass + '_image').files[0]);
                } else {
                  localStorage.setItem('db', JSON.stringify(db));
                }
              };
              this.delete = function(what, index) { // TODO: trash it
                if (confirm('Procedo con l\'eliminazione della voce?')) {
                  if (what) {
                    this.selected[what].splice(index, 1);
                  } else {
                    for (var i = 0; i < this.data.length; ++i)
                      if (this.data[i] === this.selected) {
                        this.data.splice(i, 1);
                        break;
                      }
                    this.selected = null;
                    this.update();
                  }
                }
              };
            },
            controllerAs: element.class
          };
        });
    });

    app.directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = loadEvent.target.result;
                        });
                    }
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);

    app.db = function (verb, url, data, callback) {
      var req = new XMLHttpRequest();
      req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      req.addEventListener('load', callback);
      req.open(verb, url);
      req.send(JSON.stringify(data));
    }

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };
})();

function drag(event) {
  event.dataTransfer.setData("id", event.target.id);
}
function allowDrop(event) {
  var id = event.dataTransfer.getData("text"),
    object = document.getElementById(id).getAttribute('data-type'),
    container = event.target.getAttribute('data-type');

  if (container === 'trash') {
    event.dataTransfer.dropEffect = 'move';
    event.preventDefault();
  } else if (container === 'people' && object === 'person') {
    event.preventDefault();
  }
}
function drop(event) {
  event.preventDefault();

  var id = event.dataTransfer.getData("id"),
    object = document.getElementById(id);

  switch (event.dataTransfer.dropEffect) {
    case 'copy':
      event.currentTarget.appendChild(object.cloneNode(true));
      break;
    case 'move':
      event.currentTarget.appendChild(object);
      break;
    case 'link':

      var link = document.createElement('div');
      link.setAttribute('data-type', document.getElementById(data).getAttribute('data-type'));
      link.setAttribute('data-refid', data);
      link.appendChild();
      event.currentTarget.appendChild(link);
      break;
  }
  function HTTPRequest(verb, data) {

  }
  function toggle(event, docs) {

  }
}
