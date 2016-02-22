var root   = "./",
    src    = root + "src/",
    dist   = root + "dist/",
    jsSrc  = src + "js/",
    jsDst  = dist + "js/",
    node   = root + "node_modules/",
    bower  = root + "bower_components/",
    imgSrc = src + "images/",
    imgDst = dist + "images/",
    artDst = imgDst + "art/";

module.exports = {
    "root":            root,
    "dist":            dist,
    "package":         root + "package.json",
    "jade":            src + "jade/",
    "less":            src + "less/",
    "css":             dist + "css/",
    "fonts":           dist + "fonts/",
    "readMeSrc":       src + "README.md",
    "readMeDst":       root + "README.md",
    "jsSrc":           jsSrc,
    "jsDst":           jsDst,
    "imgSrc":          imgSrc,
    "imgArtSrc":       imgSrc + 'art/',
    "imgDst":          imgDst,
    "imgArtDst":       artDst,
    "imgArtThumbsDst": artDst + 'thumbs/',
    "imgFancyboxDst":  dist + "img/",
    "vendor":          {
        "bootstrap":   node + "bootstrap/",
        "fontAwesome": node + "font-awesome/",
        "fancybox":    node + "fancybox/"
    }
};