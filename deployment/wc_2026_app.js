var express = require("express"),
  path = require("path"),
  fs = require("fs");
var compression = require("compression");
var app = express();
var staticRoot = __dirname + "/dist/";
var env = process.env.NODE_ENV || "production";

app.set("port", process.env.PORT || 3002);

app.use(compression());
app.use(function (req, res, next) {
   var accept = req.accepts("html", "json", "xml");
  if (accept !== "html") {
    return next();
  }
  // if the request has a '.' assume that it's for a file, move along
  var ext = path.extname(req.path);
  if (ext !== "") {
    return next();
  }
  fs.createReadStream(staticRoot + "index.html").pipe(res);
});

app.use(express.static(staticRoot));

/**
 * Redirect to index.html
 */
app.route("/*").get(function (req, res) {
  return res.sendFile(path.join(staticRoot + "index.html"));
});

app.listen(app.get("port"), function () {
  console.log(
    `WC2026 App running on: http://localhost:${app.get("port")}`,
  );
});
