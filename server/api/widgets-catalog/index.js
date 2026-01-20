const fs = require('fs');
const path = require('path');
const express = require('express');

let runtime;

module.exports = {
    init: function (_runtime) {
        runtime = _runtime;
    },

    app: function () {
        const widgetsCatalogApp = express();

        /**
         * GET widgets catalog metadata
         */
        widgetsCatalogApp.get('/api/widgets-catalog', (req, res) => {
            try {
                // ✅ Correct absolute path to widgets-catalog folder
                const catalogRoot = path.join(__dirname, '..', '..', 'widgets-catalog');

                runtime.logger.info('WIDGET CATALOG ROOT: ' + catalogRoot);
                runtime.logger.info('CATALOG EXISTS: ' + fs.existsSync(catalogRoot));

                const result = { groups: [] };

                if (!fs.existsSync(catalogRoot)) {
                    return res.json(result);
                }

                fs.readdirSync(catalogRoot, { withFileTypes: true })
                    .filter(dir => dir.isDirectory())
                    .forEach(groupDir => {
                        const groupPath = path.join(catalogRoot, groupDir.name);
                        const group = { name: groupDir.name, items: [] };

                        fs.readdirSync(groupPath, { withFileTypes: true })
                            .filter(w => w.isDirectory())
                            .forEach(widgetDir => {
                                const widgetPath = path.join(groupPath, widgetDir.name);
                                const indexFile = path.join(widgetPath, 'index.json');

                                if (!fs.existsSync(indexFile)) return;

                                const meta = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

                                group.items.push({
                                    name: meta.name,
                                    type: meta.type,
                                    path: `${groupDir.name}/${widgetDir.name}`,
                                    preview: `${groupDir.name}/${widgetDir.name}/${meta.preview}`
                                });
                            });

                        if (group.items.length > 0) {
                            result.groups.push(group);
                        }
                    });

                res.json(result);

            } catch (err) {
                runtime.logger.error('api/widgets-catalog error: ' + err);
                res.status(500).json({ error: 'unexpected_error' });
            }
        });

        return widgetsCatalogApp;
    }
};
