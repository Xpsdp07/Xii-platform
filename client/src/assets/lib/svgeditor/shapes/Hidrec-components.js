// Anamoly custom shape library
(function () {
  'use strict';

  var shapesGroupName = 'Hidrec Components';

  // 🔹 Common init function for all shapes
  function initShape(shapeInstance) {
    if (!shapeInstance.layerId) {
      shapeInstance.layerId = 'layer_' + Math.floor(Math.random() * 1000000);
    }
    shapeInstance.interactivity = shapeInstance.interactivity || {};

    const editor = window.editor;
    if (editor && editor.gaugesManager && typeof editor.gaugesManager.instantiateGaugeComponent === 'function') {
      editor.gaugesManager.instantiateGaugeComponent(shapeInstance, window.HidrecComponentRef);
    }
  }

  // 🔹 Default EC Cell or simple shape content
  function createShapeContent(labelText) {
    return [
      {
        id: '',
        type: 'path',
        attr: {
          d: 'M4 10 H64 V45 H54 V180 H49 V45 H19 V180 H14 V45 H4 Z',
          fill: '#fff',
          stroke: '#000',
          'stroke-width': 2
        }
      },
      {
        id: 'label',
        type: 'text',
        attr: {
          x: 15,
          y: 33,
          'font-size': '20',
          'font-family': 'Arial',
          'font-weight': 'bold',
          fill: '#000'
        },
        text: labelText
      }
    ];
  }

  // 🔹 LSP Pump Shape
  function createLspPumpContent() {
    return [
      {
        id: '',
        type: 'path',
        attr: {
          d: 'M15,20 Q15,10 35,10 Q55,10 55,20 V80 Q55,90 35,90 Q15,90 15,80 Z',
          fill: '#fff',
          stroke: '#000',
          'stroke-width': 4
        }
      },
      {
        id: 'port1',
        type: 'rect',
        attr: { x: 55, y: 23, width: 12, height: 12, fill: '#fff', stroke: '#000', 'stroke-width': 4 }
      },
      {
        id: 'port2',
        type: 'rect',
        attr: { x: 55, y: 73, width: 12, height: 12, fill: '#fff', stroke: '#000', 'stroke-width': 4 }
      },
      {
        id: 'label',
        type: 'text',
        attr: {
          x: 25,
          y: 55,
          'font-size': '16',
          'font-family': 'Arial',
          'font-weight': 'bold',
          fill: '#000'
        },
        text: 'LSP Pump'
      }
    ];
  }

  // 🔹 BOG Filter Shape
  function createsettlerContent() {
    return [
        // Main cylindrical body (outer shell)
        {
        id: 'body',
        type: 'path',
        attr: {
            d: 'M20,20 Q20,10 60,10 Q100,10 100,20 V110 Q100,120 60,120 Q20,120 20,110 Z',
            fill: '#fff',
            stroke: '#000',
            'stroke-width': 3
        }
        },

        // Left Port (Inlet)
        {
        id: 'port1',
        type: 'rect',
        attr: {
            x: 5,
            y: 58,
            width: 15,
            height: 15,
            fill: '#fff',
            stroke: '#000',
            'stroke-width': 3
        }
        },

        // Right Port (Outlet)
        {
        id: 'port2',
        type: 'rect',
        attr: {
            x: 100,
            y: 58,
            width: 15,
            height: 15,
            fill: '#fff',
            stroke: '#000',
            'stroke-width': 3
        }
        },

        // Inner Mesh (Filter Grid Pattern)
        {
        id: 'mesh1',
        type: 'line',
        attr: {
            x1: 30,
            y1: 35,
            x2: 90,
            y2: 95,
            stroke: '#000',
            'stroke-width': 2
        }
        },
        {
        id: 'mesh2',
        type: 'line',
        attr: {
            x1: 90,
            y1: 35,
            x2: 30,
            y2: 95,
            stroke: '#000',
            'stroke-width': 2
        }
        },
        {
        id: 'mesh3',
        type: 'line',
        attr: {
            x1: 30,
            y1: 65,
            x2: 90,
            y2: 65,
            stroke: '#000',
            'stroke-width': 1.5
        }
        },
        {
        id: 'mesh4',
        type: 'line',
        attr: {
            x1: 60,
            y1: 35,
            x2: 60,
            y2: 95,
            stroke: '#000',
            'stroke-width': 1.5
        }
        },

        // Label (centered below body)
        {
        id: 'label',
        type: 'text',
        attr: {
            x: 60,
            y: 145,
            'font-size': '18',
            'font-family': 'Arial',
            'font-weight': 'bold',
            fill: '#000',
            'text-anchor': 'middle'
        },
        text: 'settler'
        }
    ];
  }
//   bogfilter
// 🔹 Function to create Exchanger Filter content
    function createExchFilterContent() {
        return [
            {
            id: '',
            type: 'path',
            attr: {
                d: 'M 0,0 70,70 M 14,0 70,56 M 28,0 70,42 M 42,0 70,28 M 56,0 70,14 M 0,14 56,70 M 0,28 42,70 M 0,42 28,70 M 0,56 14,70 M 0,14 14,0 M 0,28 28,0 M 0,42 42,0 M 0,56 56,0 M 0,70 70,0 M 70,14 14,70 M 28,70 70,28 M 70,42 42,70 M 56,70 70,56 M 0,0 H 70 V 70 H 0 Z'
            }
            }
        ];
    }


  // 🔹 All components
  var componentList = [
    { name: 'ec-cell', label: 'EC Cell', icon: 'assets/lib/svgeditor/shapes/img/Ec-cell.svg' },
    { name: 'lsp-pump', label: 'LSP Pump', icon: 'assets/lib/svgeditor/shapes/img/tank8.svg' },
    { name: 'settler', label: 'Settler', icon: 'assets/lib/svgeditor/shapes/img/settler.svg' },
    { name: 'bog-filter', label: 'Bog Filter', icon: 'assets/lib/svgeditor/shapes/img/exchanger-filter.svg' }
  ];

  // 🔹 Create and assign specific content functions automatically
  var shapes = componentList.map(function (item) {
    let content;
    switch (item.name) {
        case 'lsp-pump':
            content = createLspPumpContent();
            break;
        case 'settler':
            content = createsettlerContent();      // ✅ Settler shape
            break;
        case 'bog-filter':
            content = createExchFilterContent();   // ✅ Exchanger Filter shape
            break;
        default:
            content = createShapeContent(item.label);
    }

    return {
      name: item.name,
      ico: item.icon,
      content: content,
      init: initShape
    };
  });

  // 🔹 Register all shapes
  if (svgEditor.shapesGrps[shapesGroupName]) {
    svgEditor.shapesGrps[shapesGroupName].push(...shapes);
  } else {
    svgEditor.shapesGrps[shapesGroupName] = shapes;
  }
})();
