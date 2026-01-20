(function () {
    'use strict';

    // Group name shown inside Shapes panel
    var shapesGroupName = 'editor.electrical.switchingcontrol';

    // Must be "shapes" (FUXA internal binding)
    var typeId = 'shapes';

    // Electrical Basic Components
    var shapes = [

        // -------------------------------
        // switching control 
        // -------------------------------
        {
            name: 'openswitch',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/openswitch_icon.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/openswitch.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/openswitch.svg'
                    }
                }
            ]
        },
        {
            name: 'closedswitch',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/closedswitch_icon.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/closedswitch.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/closedswitch.svg'
                    }
                }
            ]
        },
        {
            name: 'cell',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/cell_icon.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/cell_icon.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/cell_icon.svg'
                    }
                }
            ]
        },
        {
            name: 'battery',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/battery_icon.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/battery_icon.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/battery_icon.svg'
                    }
                }
            ]
        },
        {
            name: 'diode',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/diode_icon.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/diode_icon.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/diode_icon.svg'
                    }
                }
            ]
        },
        {
            name: 'resistor',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/resistor.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/resistor.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/resistor.svg'
                    }
                }
            ]
        },
        {
            name: 'ground',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/ground.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/ground.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/ground.svg'
                    }
                }
            ]
        },
        {
            name: 'control_relay_a1a2',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/control_relay_a1a2.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/control_relay_a1a2.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/control_relay_a1a2.svg'
                    }
                }
            ]
        },
        {
            name: 'power_relay',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/power_relay.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/power_relay.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/power_relay.svg'
                    }
                }
            ]
        },
        {
            name: 'contactor',
            ico: 'assets/lib/svgeditor/shapes/electrical/switching_control/contactor.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 90,
                        height: 90,
                        href: 'assets/lib/svgeditor/shapes/electrical/switching_control/contactor.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/switching_control/contactor.svg'
                    }
                }
            ]
        },


    ];

    // Prefix name: 
    shapes.forEach(function (s) {
        s.name = typeId + '-' + s.name;
    });

    // Register group
    if (svgEditor.shapesGrps[shapesGroupName]) {
        svgEditor.shapesGrps[shapesGroupName] =
            svgEditor.shapesGrps[shapesGroupName].concat(shapes);
    } else {
        svgEditor.shapesGrps[shapesGroupName] = shapes;
    }

})();
