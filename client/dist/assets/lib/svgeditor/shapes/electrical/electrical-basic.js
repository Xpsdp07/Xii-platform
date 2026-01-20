(function () {
    'use strict';

    // Group name shown inside Shapes panel
    var shapesGroupName = 'editor.electrical-basic';

    // Must be "shapes" (FUXA internal binding)
    var typeId = 'shapes';

    // Electrical Basic Components
    var shapes = [

        
        // 2 POLE MCB
        // -------------------------------
        {
            name: 'mcb_2pole',
            ico: 'assets/lib/svgeditor/shapes/electrical/basic/mcb_2pole.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 60,
                        height: 120,
                        href: 'assets/lib/svgeditor/shapes/electrical/basic/mcb_2pole.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/basic/mcb_2pole.svg'
                    }
                }
            ]
        },
        
        // MCCB
        // -------------------------------
        {
            name: 'MCCB',
            ico: 'assets/lib/svgeditor/shapes/electrical/basic/mccb.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 60,
                        height: 120,
                        href: 'assets/lib/svgeditor/shapes/electrical/basic/mccb.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/basic/mccb.svg'
                    }
                }
            ]
        },

        // -------------------------------
        // BULB
        // -------------------------------
        {
            name: 'bulb',
            ico: 'assets/lib/svgeditor/shapes/electrical/basic/bulb.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 60,
                        height: 80,
                        href: 'assets/lib/svgeditor/shapes/electrical/basic/bulb.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/basic/bulb.svg'
                    }
                }
            ]
        },

        // ------------------------------- spd
        {
            name: 'spd',
            ico: 'assets/lib/svgeditor/shapes/electrical/basic/spd.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 60,
                        height: 120,
                        href: 'assets/lib/svgeditor/shapes/electrical/basic/spd.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/basic/spd.svg'
                    }
                }
            ]
        },
        // ------------------------------- fuse
        {
            name: 'fuse',
            ico: 'assets/lib/svgeditor/shapes/electrical/basic/fuse.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 60,
                        height: 120,
                        href: 'assets/lib/svgeditor/shapes/electrical/basic/fuse.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/basic/fuse.svg'
                    }
                }
            ]
        },
        
        // -------------------------------
        // SSR
        // -------------------------------
        {
            name: 'ssr',
            ico: 'assets/lib/svgeditor/shapes/electrical/basic/ssr-icon.svg',
            content: [
                {
                    id: '',
                    type: 'image',
                    attr: {
                        x: 0,
                        y: 0,
                        width: 70,
                        height: 70,
                        href: 'assets/lib/svgeditor/shapes/electrical/basic/ssr.svg',
                        'xlink:href': 'assets/lib/svgeditor/shapes/electrical/basic/ssr.svg'
                    }
                }
            ]
        }

    ];

    // Prefix name: shapes-mcb_2pole, shapes-bulb, ...
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
