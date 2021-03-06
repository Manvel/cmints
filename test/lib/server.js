"use strict";

require("chai").should();
const {get} = require("http");
const server = "http://localhost:3000";
const {runServer} = require("../../lib/server");
const {init} = require("../../lib/cmints");
const {contentDir} = require("../../config").dirs;
const fs = require("fs");
const fileExist = fs.existsSync;
const argv = require("minimist")(process.argv.slice(2));
const gzipExt = ".gzip";

const caches = ["index.html", "ru/index.html",
                "path1.html", "main.css"];

// Add Gzip to the caches array
const gzipCaches = caches.map((cachedFile) => cachedFile + gzipExt);
caches.push(...gzipCaches);

function testCaching()
{
  // Testing the cache
  describe("Test if files have been cached", () =>
  {
    for (let cachedFile of caches)
    {
      const filePath = `${contentDir}/${cachedFile}`;
      describe(`Does ${filePath} exist`, () =>
      {
        let shouldExist = true;
        if (!argv.testgzip && filePath.includes(gzipExt))
          shouldExist = false;
        it(`Should${shouldExist ? "" : "n't"} exist`, (done) =>
        {
          if (shouldExist)
          {
            fileExist(filePath).should.equal(shouldExist);
          }
          else
          {
            fileExist(filePath).should.equal(shouldExist);
          }
          done();
        });
      });
    }
  });
}

function generationIndex()
{
  const staticFiles = [
    {
      path: "en/2018/10/20/permalink.html",
      exist: false
    },
    {
      path: "2018/10/20/permalink.html",
      exist: true
    },
    {
      path: "index.html",
      exist: true
    },
    {
      path: "en/index.html",
      exist: false
    }];
  for (const {path, exist} of staticFiles)
  {
    const filePath = `${contentDir}/${path}`;
    it(`${filePath} Should${exist ? "" : "n't"}  exist`, (done) =>
    {
      fileExist(filePath).should.equal(exist);
      done();
    });
  }
}

function testPermalinkGeneration()
{
  const generatedPermalinks = [
    ["2018/10/20/permalink.html", true],
    ["ru/2018/10/20/permalink.html", true],
    ["ru/permalinks/index.html", false],
    ["en/permalinks/index.html", false]
  ];

  describe("Test if permalink files are generated correctly", () =>
  {
    for (const [generatedFile, exists] of generatedPermalinks)
    {
      const filePath = `${contentDir}/${generatedFile}`;
      it(`${filePath} Should${exists ? "" : "n't"} exist`, (done) =>
      {
        if (exists)
        {
          fileExist(filePath).should.equal(exists);
        }
        else
        {
          fileExist(filePath).should.equal(exists);
        }
        done();
      });
    }
  });
}

function requestCodes(url, code, type)
{
  describe(`Status code for ${url}`, () =>
  {
    let contentTypeText = "";
    if (type)
      contentTypeText = ` and contentType is ${type}`;

    it(`res.statusCode is ${code}${contentTypeText}`, (done) =>
    {
      get(url, (res) =>
      {
        res.statusCode.should.equal(code);
        if (type)
        {
          const contentType = res.headers["content-type"];
          if (type == "none")
          {
            (typeof contentType).should.equal("undefined");
          }
          else
          {
            res.headers["content-type"].should.equal(type);
          }
        }
        done();
      });
    });
  });
}

function generationDouble()
{
  const staticFiles = [
    "en/2018/10/20/permalink.html", "2018/10/20/permalink.html",
    "index.html", "en/index.html"];
  for (const staticFile of staticFiles)
  {
    const filePath = `${contentDir}/${staticFile}`;
    it(`${filePath} Should  exist`, (done) =>
    {
      fileExist(filePath).should.equal(true);
      done();
    });
  }
}

function testRequestCodes(pathCodes, notFounds)
{
  for (let code in pathCodes)
  {
    for (let requestPath of pathCodes[code])
    {
      requestCodes(`${server}/${requestPath}`, Number(code));
    }
  }

  for (const type in notFounds)
  {
    const paths = notFounds[type];
    for (const path of paths)
    {
      // const contentType = type == "none" ? null : type;
      requestCodes(`${server}/${path}`, 404, type);
    }
  }
}

if (argv.server)
{
  if (argv.double)
  {
    const pathCodes = {
      200: ["en", "", "ru", "ru", "path1", "en/path1", "path1/subpath1",
            "main.css", "verification", "?query#fragment",
            "no-extension", "2018/10/20/permalink", "en/2018/10/20/permalink",
            "ru/2018/10/20/permalink",
            "permalinkpath", "toppermalinktarget", "images/logo.png",
            "hello-world.html", "markup", "js/_underscore.js"],
      501: ["unsupported.smth"]
    };

    const notFounds =
    {
      // return defined 404.md page
      "text/html": ["index", "ru/index", "nofile", "de/path1", "permalinks",
                    "ru/permalinks", "permalinks/subpath", "toplevelpermalink",
                    "images", "_draft", "path1/_subdraft"],
      // no content-type header
      "none": ["index.md", "path1.md", "logo.png", "public/main.css",
               "js/modules/_robot.js", "css/modules/_variables.js",
               "markup.html"]
    };
    describe("Generation type Double server", () =>
    {
      before((done) =>
      {
        init(() =>
        {
          runServer(argv);
          done();
        });
      });
      testRequestCodes(pathCodes, notFounds);
      after((done) =>
      {
        done();
      });
    });
  }
  else
  {
    // Generation type Index
    const pathCodes = {
      200: ["", "ru", "ru", "path1", "path1/subpath1",
            "main.css", "verification", "?query#fragment",
            "no-extension", "2018/10/20/permalink", "ru/2018/10/20/permalink",
            "permalinkpath", "toppermalinktarget", "images/logo.png",
            "hello-world.html", "markup", "js/_underscore.js"],
      501: ["unsupported.smth"]
    };

    const notFounds =
    {
      // return defined 404.md page
      "text/html": ["index", "ru/index", "nofile", "en", "en/path1", "de/path1",
                    "permalinks", "ru/permalinks", "permalinks/subpath",
                    "toplevelpermalink", "images", "_draft", "path1/_subdraft"],
      // no content-type header
      "none": ["index.md", "path1.md", "logo.png", "public/main.css",
               "js/modules/_robot.js", "css/modules/_variables.js",
               "markup.html"]
    };

    testRequestCodes(pathCodes, notFounds);
    testCaching();
  }
}
else if (argv.static)
{
  if (argv.double)
  {
    describe("Testing generation type double", () =>
    {
      generationDouble();
    });
  }
  else
  {
    // THIS TEST IS CALLED DIRECTLY
    describe(`Testing static content generation ${argv.testgzip ? "" : "with cache"}`, () =>
    {
      testCaching();
      testPermalinkGeneration();
      generationIndex();
      after((done) =>
      {
        done();
      });
    });
  }
}
else if (argv.draft)
{
  describe("Testing draft pages", () =>
  {
    before((done) =>
    {
      init(() =>
      {
        runServer(argv);
        done();
      });
    });

    ["_draft", "path1/_subdraft", "/js/_underscore.js"].forEach((draft) =>
    {
      requestCodes(`${server}/${draft}`, 200);
    });

    after((done) =>
    {
      done();
    });
  });
}

