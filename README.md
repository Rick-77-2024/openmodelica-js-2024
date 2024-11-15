# *mdpad*

## Live, interactive Markdown pages with embedded JavaScript and YAML

*mdpad* pages are meant to be an easy way to make simple web
interfaces or workbooks. These can be hosted as static pages.
Interactivity is provided by JavaScript.

The target audience is someone who knows a bit of JavaScript and wants
to make simple web applications. The key feature of *mdpad* is easy
authoring of interactive web pages:

- Markdown for clean, easy page creation
- No complicated JavaScript toolkits
- No tangled callbacks
- Easy form creation
- Helpers to load more scripts
- Helpers to load CSV, JSON, and XML data
- Plotting built in

Markdown is an easy way to make web pages, and with a bit of glue,
JavaScript code blocks become "live". Data and form elements entered
using a Markdown extension for forms are also converted to JavaScript
variables.

Here is an example of a Javascript code input section. When the input
`freq` is updated, the page will recalculate, and the output of each
code section will appear below the input. Here's some example
Markdown:

    ## Simple function plotter

    Adjust the frequency, and see the plot update:

    freq = ___(3.0)

    ```js output=markdown
    println("## Results")
    ```

    ```js
    x = numeric.linspace(0,6.3,200)
    y = numeric.cos(numeric.mul(x,freq))

    series = _.zip(x,y)       // converts to [[x1,y1],[x2,y2],...]

    plot([series])
    ```

When run, it will look like this in a browser:

![mdpad screen capture](https://rick-77-2024.github.com/mdpad/mdpad_screenshot.png)

In the JavaScript block header, you can specify the result type as
`markdown` for Markdown output (also useful for HTML, since Markdown
files can contain HTML). `output` can also be `"none"` to suppress
output (not implemented, yet).

In the example above, a text entry box is specified with `freq` =
`___(3.0)`. In JavaScript, `freq` is assigned to the value entered in the
text box (a string). The default value is "3.0". Any form elements
will be translated into JavaScript variables.

Here are several examples:

* `example.md`
  ([Live results](https://rick-77-2024.github.com/mdpad/mdpad.html?example.md))
  ([Markdown](https://rick-77-2024.github.com/mdpad/example.md))
  -- Covers forms, data input, and plotting.

* `yaml_usage.md`
  ([Live results](https://rick-77-2024.github.com/mdpad/mdpad.html?yaml_usage.md))
  ([Markdown](https://rick-77-2024.github.com/mdpad/yaml_usage.md))
  -- Covers YAML and text input blocks and uses for loading CSV, JSON,
  XML, and YAML data as well as loading scripts and creating forms.

* `numericjs.md`
  ([Live results](https://rick-77-2024.github.com/mdpad/mdpad.html?numericjs.md))
  ([Markdown](https://rick-77-2024.github.com/mdpad/numericjs.md))
  -- Example using the [Numeric Javascript](http://www.numericjs.com/)
     package.

Here are several real-world examples in my area of work:

* [http://distributionhandbook.com/calculators/](http://distributionhandbook.com/calculators/)

Here's an interface to a simulation compiled using
[Emscripten](http://emscripten.org/).

* `Modelica.Electrical.Analog.Examples.ChuaCircuit.md`
  ([Live results](https://rick-77-2024.github.com/mdpad/mdpad.html?Modelica.Electrical.Analog.Examples.ChuaCircuit.md))
  ([Markdown](https://rick-77-2024.github.com/mdpad/Modelica.Electrical.Analog.Examples.ChuaCircuit.md))
  -- OpenModelica simulation model of a Chua circuit.


## Features

*Plotting* -- There are several very good JavaScript libraries for plotting and
graphing. I've tried out and included Flot and HighCharts in
`mdpad.html`. I've also tried D3, NVD3, and Vega.

*YAML* -- Enter data into JavaScript using [YAML](www.yaml.org). YAML
is a plain text format for describing nested data structures. It is
easier to read and write than JSON or XML. Here is an example:

    ```yaml name=d
    fred: 27
    wilma: [1,2,3]
    ```

Now, in a JavaScript block, you can access `d.fred` (`27`) or
`d.wilma` (the array `[1,2,3]`).

*Form elements* -- Using the `freq` = `___(3.0)` notation described above is one
way to enter form elements. This is only useful for simple inputs. For more
complicated form arrangements, you can directly use HTML or use YAML. I like
using the [jQuery.dForm package](http://daffl.github.io/jquery.dform/) to create
form elements. You can specify form element characteristics as YAML or JSON, and
nice-looking forms are generated with the option of using
[Bootstrap 3](http://getbootstrap.com). When the user updates a form element,
the whole page recalculates.

*HTML templates* -- The [Emblem](http://emblemjs.com/) package is great for
concisely entering HTML. I use this for both input forms and output templates.
Here's a simple example:

    ```emblem
    ul
      li bullet 1
      li bullet 2
      li bullet 3
    ```

## Installing / Using

Really, you just need to copy the files, or fork this github project.
You do need to view the page using a server. Here's a typical URL:

    http://localhost:2000/mdpad.html?example.md

Here, I'm running a server on my local computer on port 2000. The main
html file is `mdpad.html`. This loads the *mdpad* page `example.md`.
The base html file is used to load the appropriate libraries. You may
want to change this to include custom headers or footers for your
site.

For editing *mdpad* files, [Atom](https://atom.io/) and
[SublimeText](http://www.sublimetext.com/) work well. Both of these have
good support for syntax highlighting JavaScript and YAML blocks within
Markdown files. I like Atom with the [markdown-folder package](https://github.com/melke/markdown-folder) that can
fold and unfold headings and code blocks. Here is a demo:

![Folding in action](https://github.com/rick-77-2024/markdown-folder/raw/master/markdown-folder-mdpad.gif)

The [atom-mdpad package](https://atom.io/packages/mdpad)
is an extension that adds a live preview and snippets specific to mdpad. Here is
an example with both the live preview and snippets are used. The live preview
is an alternative to running a server on your local computer.

![mdpad in action](https://github.com/rick-77-2024/atom-mdpad/raw/master/atom-mdpad.gif)

Another alternative to the live preview is to use Atom to start a server. The
[local-server-express](https://atom.io/packages/local-server-express) package
works nicely for this. Once launched, this will open a browser. You can also use
the [Browser Plus](https://atom.io/packages/browser-plus) package to load this
right in Atom. With the live refresh feature, it works much like the Live
Preview.

## Inspiration / Ideas

* [Julia Markdown](https://github.com/rick-77-2024/JuliaMarkdown)

* [Active Markdown](http://activemarkdown.org)

* [R Markdown](http://rstudio.org/docs/authoring/using_markdown),
  [Rpubs hosting](http://rpubs.com/)

* [IPython notebook](http://ipython.org/ipython-doc/dev/interactive/htmlnotebook.html)

## Infrastructure

Most of the infrastructure for this was already in place for the web
REPL.

*Markdown conversion* -- The Markdown is converted to HTML using a
[Showdown](https://github.com/coreyti/showdown/) with extensions to
handle input blocks and form elements.

*Form inputs* -- The modifications for form elements are adapted from
[here](https://github.com/brikis98/wmd). Only one element is included
right now.

*Plotting* -- Plotting comes from the
[Flot](http://www.flotcharts.org/) package.

*YAML* -- YAML conversion comes from the
[js-yaml](https://github.com/nodeca/js-yaml) package.


## Current status

Everything's pretty much beta stage right now. The main code is about
200 lines of code. Many of the libraries used (Flot, yaml-js, showdown,
etc.) are pretty mature.

MIT licensed.
