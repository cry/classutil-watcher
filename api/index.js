var api = function() {};

const fs = require('fs');
const jsdom = require("jsdom");
const request = require("request");

const { JSDOM } = jsdom;

const scrape_script = `
window.courses = (_ => {
    courses = {};


    try {
        courses["updated"] = document.querySelector("p > b").textContent.replace("  ", " ");

        (Array.from(document.querySelectorAll("tr:not(.rowHighlight):not(.rowLowlight):not(.cufatrow)")).slice(2, this.length - 11)).forEach((val) => {
            var classRow = val,
                code = val.textContent.split("  \\n")[0],
                name = val.textContent.split("  \\n")[1];

            courses[code] = {};

            while(classRow.nextElementSibling.className != "") {
                var div = classRow.nextElementSibling.childNodes;

                courses[code][div[1].textContent] = courses[code][div[1].textContent] || [];

                courses[code][div[1].textContent].push({
                    code: div[2].textContent,
                    status: div[5].textContent,
                    enrolled: div[6].textContent,
                    percent: div[8].textContent.slice(0, -2),
                    location: div[10].textContent
                });

                classRow = classRow.nextElementSibling;
            }
        });
    } catch (e) {
        return {
            err: "No data found."
        };
    }

	return courses;
})();
`;

api.prototype.get = (faculty, session, callback) => {

    const validFaculties = ["ACCT","ACTL","AERO","ANAT","ARCH","ARTS","ASIA","ATSI","AUST","AVEN","AVIA","AVIF","AVIG","BABS","BEES","BEIL","BENV","BINF","BIOC","BIOM","BIOS","BIOT","BLDG","CEIC","CHEM","CHEN","CLIM","CODE","COMD","COMM","COMP","CONS","CRIM","CRTV","CVEN","DATA","DIPP","ECON","EDST","ELEC","ENGG","ENGL","ENVP","ENVS","EXCH","FINS","FNDN","FOOD","GBAT","GENC","GENE","GENL","GENM","GENS","GENT","GENY","GEOL","GEOS","GMAT","GSBE","GSOE","HESC","HIST","HUML","HUMS","IDES","IEST","INDC","INFS","INST","INTA","INTD","JAPN","JURD","LAND","LAWS","LING","MANF","MARK","MATH","MATS","MBAX","MDCN","MDIA","MECH","MFAC","MFIN","MGMT","MICR","MINE","MMAN","MNGT","MNNG","MODL","MSCI","MTRN","MUPS","MUSC","NANO","NAVL","NCHR","NEUR","OBST","OPTM","PAED","PATH","PHAR","PHCM","PHIL","PHOP","PHSL","PHTN","PHYS","PLAN","POLS","POLY","PSCY","PSYC","PTRL","REGZ","REST","RISK","SCIF","SENG","SLSP","SOCF","SOCW","SOLA","SOMS","SOSS","SPRC","SRAP","STAM","SURG","SUSD","SWCH","TABL","TELE","UDES","VISN","WOMS","YENG","YMED","ADAD","SAED","SAHT","SART","SDES","SOMA","ZBUS","ZEIT","ZGEN","ZHSS","ZINT","ZPEM"];
    const validSessions = ["X1", "S2", "S1"];

    if (!(~validFaculties.indexOf(faculty) && ~validSessions.indexOf(session))) {
        callback({
            err: "Invalid parameters passed."
        });

        return;
    }

    request(`http://classutil.unsw.edu.au/${faculty}_${session}.html`, function (error, response, body) {
        if (error) {
            callback({
                error: `Error during request: ${err}`
            });

            return;
        }

        const window = (new JSDOM(body, { runScripts: "outside-only" })).window;

        window.eval(scrape_script);

        callback(window.courses);
    });

};

module.exports = new api();
