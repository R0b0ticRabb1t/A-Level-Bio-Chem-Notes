/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LinkWithAliasPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/ListenerRegistry.ts
var ListenerRegistry = class {
  constructor(name) {
    this.name = name;
    this.callbacks = [];
  }
  /**
   * Calls all registered callbacks
   * @param args
   */
  process(args) {
    if (this.callbacks.length === 0) {
      return;
    }
    const callbacks = [...this.callbacks];
    this.callbacks.length = 0;
    callbacks.forEach((item) => {
      if (!item.destroyed && item.callback(args)) {
        if (!item.destroyed) {
          this.callbacks.push(item);
        }
      }
    });
  }
  /**
   * register callback which will be called with each `process` method calls as long as callback returns true or Unregister method is not called.
   * @param callback
   * @returns
   */
  register(callback) {
    const item = { callback };
    this.callbacks.push(item);
    return () => {
      item.destroyed = true;
      this.callbacks.remove(item);
    };
  }
};

// src/PositionUtils.ts
function locToEditorPositon(loc) {
  return {
    line: loc.line,
    ch: loc.col
  };
}
function moveEditorPosition(loc, offsetDif) {
  const loc2 = {
    line: loc.line,
    ch: loc.ch + offsetDif
  };
  if (loc2.ch < 0) {
    throw new Error("Negative col");
  }
  return loc2;
}
function moveLoc(loc, offsetDif) {
  const loc2 = {
    line: loc.line,
    col: loc.col + offsetDif,
    offset: loc.offset + offsetDif
  };
  if (loc2.col < 0) {
    throw new Error("Negative col");
  }
  return loc2;
}
function moveCursor(editor, offsetDif) {
  const newPos = moveEditorPosition(editor.getCursor(), offsetDif);
  editor.setCursor(newPos);
  return newPos;
}
function isEditorPositionInPos(cursor, pos, includingStart = false, includingEnd = false) {
  if (includingStart) {
    if (comparePosition(cursor, pos.start) < 0) {
      return false;
    }
  } else {
    if (comparePosition(cursor, pos.start) <= 0) {
      return false;
    }
  }
  if (includingEnd) {
    if (comparePosition(cursor, pos.end) > 0) {
      return false;
    }
  } else {
    if (comparePosition(cursor, pos.end) >= 0) {
      return false;
    }
  }
  return true;
}
function getColumn(a) {
  if ("ch" in a) {
    return a.ch;
  }
  return a.col;
}
function comparePosition(a, b) {
  const lineDif = a.line - b.line;
  if (lineDif !== 0) {
    return lineDif;
  }
  return getColumn(a) - getColumn(b);
}
function equalsPosition(a, b) {
  if (a.line !== b.line) {
    return false;
  }
  return getColumn(a) == getColumn(b);
}

// src/EditorCursorListener.ts
var EditorCursorListener = class {
  /**
   *
   * @param plugin
   * @param cursorCheckTimeout number of ms when cursor position has to be checked
   */
  constructor(plugin, cursorCheckTimeout = 1e3) {
    this.plugin = plugin;
    this.listenerRegistry = new ListenerRegistry("EditorCursorListener");
    this.plugin.registerEvent(
      //Listen on closing or deactivation current editor
      this.plugin.app.workspace.on("active-leaf-change", (leaf) => {
        this.listenerRegistry.process({ leaf });
      })
    );
    this.plugin.registerInterval(window.setInterval(() => this.onTimeInterval(), cursorCheckTimeout));
  }
  onTimeInterval() {
    this.listenerRegistry.process({});
  }
  /**
   * Calls `onCursorChange` when cursor moves or when editor becomes inactive
   * @param editor
   * @param onCursorChange
   */
  fireOnCursorChange(editor, onCursorChange) {
    let lastCursorPosition = editor.getCursor();
    return this.listenerRegistry.register(({ leaf }) => {
      const cursorPosition = editor.getCursor();
      if (equalsPosition(cursorPosition, lastCursorPosition) || onCursorChange(cursorPosition)) {
        lastCursorPosition = cursorPosition;
      }
      return true;
    });
  }
};

// src/Utils.ts
function toArray(v) {
  if (v == null) {
    return [];
  }
  if (Array.isArray(v)) {
    return v;
  }
  return [v];
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substring(1);
}

// src/InjectAlias.ts
var aliasPropertyNames = ["aliases", "alias"];
async function addMissingAliasesIntoFile(fileManager, file, requiredAliases) {
  await fileManager.processFrontMatter(file, (frontmatter) => {
    if (typeof frontmatter == "object") {
      const aliasPropName = aliasPropertyNames.find((name) => frontmatter[name] != null) || aliasPropertyNames[0];
      const existingAliases = toArray(frontmatter[aliasPropName]);
      const toBeAdded = [];
      requiredAliases.forEach((requiredAlias) => {
        const lowercaseRequiredAlias = requiredAlias.toLocaleLowerCase();
        if (!existingAliases.some((alias) => alias.toLocaleLowerCase() == lowercaseRequiredAlias)) {
          toBeAdded.push(requiredAlias);
        }
      });
      if (toBeAdded.length === 0) {
        return;
      }
      const newAliases = [...existingAliases, ...toBeAdded];
      newAliases.sort((a, b) => b.length - a.length);
      frontmatter[aliasPropName] = newAliases;
    }
  });
}

// src/MarkdownUtils.ts
var linkPrefix = "[[";
var linkSuffix = "]]";
var displaTextSeparator = "|";
function getReferenceCacheFromEditor(editor, pos) {
  if (!pos)
    pos = editor.getCursor();
  const line = editor.getLine(pos.line);
  let posOffset = pos.ch;
  if (line.substring(posOffset, posOffset + 2) == linkPrefix) {
    posOffset += 2;
  }
  if (line.charAt(posOffset) == "]") {
    posOffset--;
  }
  let lastLookup;
  let endIdx = firstIndexOf(line, posOffset, (lookup) => {
    lastLookup = lookup(2);
    return lastLookup == linkSuffix || lastLookup == linkPrefix;
  });
  if (endIdx < 0 || lastLookup != linkSuffix) {
    return;
  }
  endIdx += linkSuffix.length;
  let lastLookup2;
  const startIdx = lastIndexOf(line, posOffset, (lookup) => {
    lastLookup2 = lookup(2);
    return lastLookup2 == linkSuffix || lastLookup2 == linkPrefix;
  });
  if (startIdx < 0 || lastLookup2 != linkPrefix) {
    return;
  }
  const original = line.substring(startIdx, endIdx);
  const parts = original.substring(2, original.length - 2).split(displaTextSeparator);
  return {
    link: parts[0],
    position: {
      start: {
        col: startIdx,
        line: pos.line,
        offset: -1
      },
      end: {
        col: endIdx,
        line: pos.line,
        offset: -1
      }
    },
    original,
    //keep displayText undefined in case the link contains no display text, just link name
    displayText: parts[1]
  };
}
function firstIndexOf(str, from, predicate) {
  const len = str.length;
  const lookupFn = (count) => {
    return str.substring(from, Math.min(from + count, len));
  };
  while (from < len) {
    if (predicate(lookupFn)) {
      return from;
    }
    from++;
  }
  return -1;
}
function lastIndexOf(str, from, predicate) {
  const len = str.length;
  const lookupFn = (count) => {
    return str.substring(from, Math.min(from + count, len));
  };
  while (from > 0) {
    from--;
    if (predicate(lookupFn)) {
      return from;
    }
  }
  return -1;
}
function getLinkTextPosWithPipe(link) {
  if (link.displayText != null) {
    return {
      start: moveLoc(link.position.end, -link.displayText.length - 3),
      end: moveLoc(link.position.end, -2)
    };
  }
  return {
    start: moveLoc(link.position.end, -2),
    end: moveLoc(link.position.end, -2)
  };
}
function setLinkText(link, editor, linkText) {
  if (link.displayText !== linkText) {
    const linkTextPos = getLinkTextPosWithPipe(link);
    editor.replaceRange(`|${linkText}`, locToEditorPositon(linkTextPos.start), locToEditorPositon(linkTextPos.end));
    link.displayText = linkText;
  }
}

// src/VaultUtils.ts
async function getOrCreateFileOfLink(app, target, sourcePath) {
  const existingFile = app.metadataCache.getFirstLinkpathDest(target, sourcePath);
  if (existingFile) {
    return existingFile;
  }
  const filePath = app.fileManager.getNewFileParent(sourcePath).path + "/" + target + ".md";
  return app.vault.create(filePath, "");
}

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  copyDisplayText: true
};
var LinksSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    new import_obsidian.Setting(this.containerEl).setName("Copy selected text as link file").setDesc("When selected then creates link `[[text|text]]`, otherwise `[[|text]]`.").addToggle((component) => {
      component.setValue(this.plugin.settings.copyDisplayText);
      component.onChange((value) => {
        this.plugin.settings.copyDisplayText = value;
        this.plugin.saveSettings();
      });
    });
  }
  hide() {
    this.containerEl.empty();
  }
};

// src/main.ts
var LinkInfo = class {
  constructor(linkStart, file, editor, makeAlias, linkText) {
    this.linkStart = linkStart;
    this.file = file;
    this.editor = editor;
    this.makeAlias = makeAlias;
    this.linkText = linkText;
    /**  */
    this.unregister = [];
  }
  register(unregister) {
    this.unregister.push(unregister);
    return this;
  }
  destroy() {
    this.unregister.forEach((c) => c());
    this.unregister.length = 0;
  }
};
var LinkWithAliasPlugin = class extends import_obsidian2.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.settings = DEFAULT_SETTINGS;
    this.editorCursorListener = new EditorCursorListener(this);
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "create-link-with-alias",
      name: "Create link with alias",
      icon: "bracket-glyph",
      editorCallback: (editor, ctx) => {
        if (ctx.file) {
          this.createLinkFromSelection(ctx.file, editor, editor.getCursor(), {
            makeAlias: true,
            pathFromText: this.settings.copyDisplayText
          });
        }
      }
    });
    this.addCommand({
      id: "create-link",
      name: "Create link",
      icon: "bracket-glyph",
      editorCallback: (editor, ctx) => {
        if (ctx.file) {
          this.createLinkFromSelection(ctx.file, editor, editor.getCursor(), {
            makeAlias: false,
            pathFromText: this.settings.copyDisplayText
          });
        }
      }
    });
    this.addSettingTab(new LinksSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  /**
   * starts create link with alias process for current `editor` of `file` on `position`
   * Only one link is processed, so only last call matters
   * @param file
   * @param editor
   * @param position
   */
  createLinkFromSelection(file, editor, position, options) {
    const cacheLink = getReferenceCacheFromEditor(editor, position);
    if (cacheLink != null && cacheLink.position.start.col !== position.ch) {
      if (options.makeAlias) {
        this.addMissingAlias(cacheLink, file.path);
      }
      return;
    }
    const selected_word = editor.getSelection();
    let linkStart;
    let linkText;
    if (selected_word == "") {
      editor.replaceSelection(`[[]]`);
      linkStart = moveEditorPosition(moveCursor(editor, -2), -2);
    } else {
      if (options.pathFromText) {
        editor.replaceSelection(`[[${capitalize(selected_word)}|${selected_word}]]`);
        linkStart = moveEditorPosition(moveCursor(editor, -(selected_word.length + 3)), -(selected_word.length + 2));
        linkText = selected_word;
      } else {
        editor.replaceSelection(`[[|${selected_word}]]`);
        linkStart = moveEditorPosition(moveCursor(editor, -(selected_word.length + 3)), -2);
        linkText = selected_word;
      }
    }
    if (this.linkInfo) {
      this.linkInfo.destroy();
      delete this.linkInfo;
    }
    const lastLink = new LinkInfo(linkStart, file, editor, options.makeAlias, linkText);
    lastLink.register(
      //listen on cursor move or deactivation of editor
      this.editorCursorListener.fireOnCursorChange(editor, (cursorPosition) => {
        return this.handleChangeOnLastLink(editor, lastLink);
      })
    );
    this.linkInfo = lastLink;
  }
  /**
   * Handles cache or editor cursor position change on the lastLink
   * @param editor
   * @param lastLink
   * @returns false if we are finished with that link
   */
  handleChangeOnLastLink(editor, lastLink) {
    const cacheLink = getReferenceCacheFromEditor(editor, lastLink.linkStart);
    if (cacheLink && equalsPosition(lastLink.linkStart, cacheLink.position.start)) {
      if (isEditorPositionInPos(lastLink.editor.getCursor(), cacheLink.position)) {
        lastLink.linkText = cacheLink.displayText;
        return true;
      }
      if (lastLink.linkText) {
        setLinkText(cacheLink, editor, lastLink.linkText);
      }
      if (lastLink.makeAlias) {
        this.addMissingAlias(cacheLink, lastLink.file.path);
      }
      return true;
    }
    lastLink.destroy();
    return false;
  }
  /**
   * creates target file and alias if something is not existing
   * @param cacheLink
   * @param sourcePath
   * @returns
   */
  async addMissingAlias(cacheLink, sourcePath) {
    if (!cacheLink.original.contains("|") || !cacheLink.displayText) {
      return;
    }
    const linkTargetPath = cacheLink.link;
    if (!linkTargetPath) {
      return;
    }
    const target = await getOrCreateFileOfLink(this.app, linkTargetPath, sourcePath);
    await addMissingAliasesIntoFile(this.app.fileManager, target, [cacheLink.displayText]);
  }
};
