import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import plCommon from "./locales/pl/common.json";
import enBeverages from "./locales/en/beverages.json";
import plBeverages from "./locales/pl/beverages.json";
import enSupport from "./locales/en/support.json";
import plSupport from "./locales/pl/support.json";
import enHome from "./locales/en/home.json";
import plHome from "./locales/pl/home.json";
import enStats from "./locales/en/stats.json";
import plStats from "./locales/pl/stats.json";
import enNav from "./locales/en/nav.json";
import plNav from "./locales/pl/nav.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: enCommon,
                beverages: enBeverages,
                support: enSupport,
                home: enHome,
                stats: enStats,
                nav: enNav
            },
            pl: {
                common: plCommon,
                beverages: plBeverages,
                support: plSupport,
                home: plHome,
                stats: plStats,
                nav: plNav
            },
        },
        lng: "pl",
        fallbackLng: "en",
        ns: ["common", "beverages", "support", "home", "stats", "nav"],
        defaultNS: "common",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
