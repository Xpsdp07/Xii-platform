export class GaugesUtils {

    static customAttributesRegistry: {
        [widgetId: string]: {
            typeTag: string;
            attributes: { [name: string]: any };
        };
    } = {};

    static resolveTypeTag(typeOrFull: string, availableTags: string[]): string | null {
        if (!typeOrFull) return null;
        for (let tag of availableTags) {
            if (typeOrFull.startsWith(tag)) return tag;
        }
        return null;
    }

    /**
     * ✅ REPLACE attributes completely (used during Edit Save)
     */
    static setCustomAttributesForWidget(
        widgetId: string,
        typeOrFull: string,
        attributes: any[] | { [k: string]: any },
        availableTags: string[]
    ): void {
        if (!widgetId) return;
        const typeTag = this.resolveTypeTag(typeOrFull, availableTags) || typeOrFull;

        const map: { [name: string]: any } = {};

        if (Array.isArray(attributes)) {
            attributes.forEach(a => {
                if (a && a.name) {
                    map[a.name] = {
                        type: a.type ?? "",
                        value: a.value ?? ""
                    };
                }
            });
        } else if (attributes && typeof attributes === "object") {
            Object.keys(attributes).forEach(key => {
                map[key] = {
                    type: attributes[key].type ?? "",
                    value: attributes[key].value ?? attributes[key]
                };
            });
        }

        this.customAttributesRegistry[widgetId] = {
            typeTag,
            attributes: map
        };
    }

    /**
     * ✅ Get saved attributes
     */
    static getCustomAttributesForWidget(widgetId: string): { [name: string]: any } {
        return this.customAttributesRegistry[widgetId]?.attributes || {};
    }

    static getTypeTagForWidget(widgetId: string): string | null {
        return this.customAttributesRegistry[widgetId]?.typeTag || null;
    }

    /**
     * ✅ MERGE new attributes (Add Attribute tab)
     * Keeps existing + adds new ones
     */
    static mergeCustomAttributesForWidget(
        widgetId: string,
        typeOrFull: string,
        attributes: any[] | { [k: string]: any },
        availableTags: string[]
    ): void {
        console.log("🟦 mergeCustomAttributesForWidget called for:", widgetId, attributes);

        const existing = this.getCustomAttributesForWidget(widgetId);
        const merged: { [k: string]: any } = { ...existing };

        if (Array.isArray(attributes)) {
            attributes.forEach(a => {
                if (a && a.name) {
                    merged[a.name] = {
                        type: a.type ?? "",
                        value: a.value ?? ""
                    };
                }
            });
        } else if (attributes && typeof attributes === "object") {
            Object.keys(attributes).forEach(key => {
                merged[key] = {
                    type: attributes[key].type ?? "",
                    value: attributes[key].value ?? attributes[key]
                };
            });
        }

        const typeTag = this.resolveTypeTag(typeOrFull, availableTags) || typeOrFull;
        this.customAttributesRegistry[widgetId] = {
            typeTag,
            attributes: merged
        };

        console.log("✅ STORED IN REGISTRY:", this.customAttributesRegistry[widgetId]);
    }

    static removeWidgetAttributes(widgetId: string): void {
        delete this.customAttributesRegistry[widgetId];
    }

    static listAllWidgets(): any {
        return { ...this.customAttributesRegistry };
    }
}
