// Anamoly custom shape library
(function () {
  'use strict';
  var shapesGroupName = 'SBR';
  var typeId = 'sbr-block';

  var shapes = [
    {
      name: typeId,
      ico: 'assets/lib/svgeditor/shapes/img/eqt.svg',
      content: [
        { id: '', type: 'rect', attr: { width: '60', height: '40', rx: '6', ry: '6', fill: '#2196f3' } },
        { id: 'label', type: 'text', attr: { x: 10, y: 25, 'font-size': '10', fill: '#fff' }, text: 'Sensor' }
      ],
      // 🔹 Add init function to attach component immediately
      init: function (shapeInstance) {
        // Assign unique layerId if not exists
        if (!shapeInstance.layerId) {
          shapeInstance.layerId = 'layer_' + Math.floor(Math.random() * 1000000);
        }
        // Ensure interactivity object exists
        shapeInstance.interactivity = shapeInstance.interactivity || {};

        // Register Angular component globally
        const editor = (window).editor;
        if (editor && editor.gaugesManager && typeof editor.gaugesManager.instantiateGaugeComponent === 'function') {
          editor.gaugesManager.instantiateGaugeComponent(shapeInstance, window.SbrBlockComponentRef);
        }
      }
    }
  ];

  if (svgEditor.shapesGrps[shapesGroupName]) {
    for (var i = 0; i < shapes.length; i++) {
      svgEditor.shapesGrps[shapesGroupName].push(shapes[i]);
    }
  } else {
    svgEditor.shapesGrps[shapesGroupName] = shapes;
  }
})();
