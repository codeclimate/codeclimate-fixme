# Code Climate FIXME Engine

`codeclimate-fixme` is a Code Climate engine that finds comments in your code which match the following strings:

* `TODO`
* `FIXME`
* `HACK`
* `BUG`

These strings are things you should fix now, not later.

`codeclimate-fixme` is also very simple, and is intended to provide a `Hello World` like template for Code Climate Platform engine authors. It is implemented in JavaScript as an NPM package.

### Installation & Usage

1. If you haven't already, [install the Code Climate CLI](https://github.com/codeclimate/codeclimate).
2. Run `codeclimate engines:enable fixme`. This command both installs the engine and enables it in your `.codeclimate.yml` file.
3. You're ready to analyze! Browse into your project's folder and run `codeclimate analyze`.

### Configuration

You can specify what strings to match by adding a `strings` key in your
`.codeclimate.yml`:

```yaml
engines:
  fixme:
    enabled: true
    strings:
    - FIXME
    - CUSTOM
```

**NOTE**: values specified here *override* the defaults, they are not
*additional* strings to match.

### Need help?

For help with `codeclimate-fixme`, please open an issue on this repository.

If you're running into a Code Climate issue, first look over this project's [GitHub Issues](https://github.com/codeclimate/codeclimate-watson/issues), as your question may have already been covered. If not, [go ahead and open a support ticket with us](https://codeclimate.com/help).
