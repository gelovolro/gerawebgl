import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const OUTPUT_DIR            = "docs/hld-component-diagrams";
const CORE_ROOT             = "core";
const ENCODING_UTF8         = "utf8";
const DOT_INDENT            = "    ";
const DOT_GRAPH_CLOSE       = "}";
const NEWLINE               = "\n";
const EMPTY_LINE            = "";
const EDGE_DELIMITER        = "-->";
const PATH_SEPARATOR        = "/";
const DOT_OUTPUT_FORMAT     = "dot";
const MERMAID_OUTPUT_FORMAT = "mermaid";
const JSON_OUTPUT_FORMAT    = "json";
const FONT_FAMILY           = "Arial";
const GRAPH_FONT_SIZE       = 10;
const EDGE_FONT_SIZE        = 9;
const NODE_SHAPE            = "box";
const NODE_STYLE            = "rounded";
const GRAPH_DIRECTION       = "LR";
const NPM_COMMAND           = "npm run deps:generate:diagrams";
const FIRST_ITEM_INDEX      = 0;
const MIN_NESTED_PATH_PARTS = 2;
const REMOVE_FILE_OPTIONS   = Object.freeze({ force: true });

const OUTPUT_FILES = {
    markdown     : `${OUTPUT_DIR}/dependency-graph.md`,
    fullSvg      : `${OUTPUT_DIR}/dependency-graph.svg`,
    lowLevelSvg  : `${OUTPUT_DIR}/scene-math-geometry.svg`,
    renderingSvg : `${OUTPUT_DIR}/rendering-stack.svg`,
    controlsSvg  : `${OUTPUT_DIR}/controls-interaction.svg`,
    folderDot    : `${OUTPUT_DIR}/folder-dependency.dot`,
    folderSvg    : `${OUTPUT_DIR}/folder-dependency.svg`
};

const INCLUDE_PATTERNS = {
    full      : "^core",
    lowLevel  : "^core/(scene|math|geometry)",
    rendering : "^core/(engine|render|scene|material|light|shader|texture)",
    controls  : "^core/(controls|interaction|scene|math)"
};

class ArchitectureRenderer {
    run() {
        this.ensureOutputDirectory();
        this.clearGeneratedFiles();
        this.generateMarkdownGraph();
        this.generateFullSvgGraph();
        this.generateLowLevelSvgGraph();
        this.generateRenderingSvgGraph();
        this.generateControlsSvgGraph();
        this.generateFolderLevelGraph();
    }

    ensureOutputDirectory() {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    exec(command) {
        return execSync(command, {
            encoding : ENCODING_UTF8,
            stdio    : ["pipe", "pipe", "inherit"]
        });
    }

    writeFile(path, content) {
        writeFileSync(path, content, ENCODING_UTF8);
        console.log(`Generated ${path}`);
    }

    generateMarkdownGraph() {
        const mermaid  = this.execDepcruiseMermaid(INCLUDE_PATTERNS.full).trim();
        const markdown = [
            "# Dependency Graph",
            EMPTY_LINE,
            "Auto-generated dependency map for `core/`.",
            EMPTY_LINE,
            "Update:",
            "```bash",
            NPM_COMMAND,
            "```",
            EMPTY_LINE,
            "```mermaid",
            mermaid,
            "```",
            EMPTY_LINE
        ].join(NEWLINE);

        this.writeFile(OUTPUT_FILES.markdown, markdown);
    }

    generateFullSvgGraph() {
        this.generateSvgFromDepcruise(INCLUDE_PATTERNS.full, OUTPUT_FILES.fullSvg);
    }

    generateLowLevelSvgGraph() {
        this.generateSvgFromDepcruise(
            INCLUDE_PATTERNS.lowLevel,
            OUTPUT_FILES.lowLevelSvg
        );
    }

    generateRenderingSvgGraph() {
        this.generateSvgFromDepcruise(
            INCLUDE_PATTERNS.rendering,
            OUTPUT_FILES.renderingSvg
        );
    }

    generateControlsSvgGraph() {
        this.generateSvgFromDepcruise(
            INCLUDE_PATTERNS.controls,
            OUTPUT_FILES.controlsSvg
        );
    }

    generateFolderLevelGraph() {
        const cruiseJson = this.execDepcruiseJson(INCLUDE_PATTERNS.full);
        const folderDot  = this.buildFolderDependencyDot(cruiseJson);
        this.writeFile(OUTPUT_FILES.folderDot, folderDot);
        this.exec(`dot -Tsvg "${OUTPUT_FILES.folderDot}" -o "${OUTPUT_FILES.folderSvg}"`);
        console.log(`Generated ${OUTPUT_FILES.folderSvg}`);
    }

    generateSvgFromDepcruise(includeOnly, outputPath) {
        this.exec(`npx depcruise ${CORE_ROOT} --include-only "${includeOnly}" --output-type ${DOT_OUTPUT_FORMAT} | dot -Tsvg -o "${outputPath}"`);
        console.log(`Generated ${outputPath}`);
    }

    execDepcruiseMermaid(includeOnly) {
        return this.exec(`npx depcruise ${CORE_ROOT} --include-only "${includeOnly}" --output-type ${MERMAID_OUTPUT_FORMAT}`);
    }

    execDepcruiseJson(includeOnly) {
        return JSON.parse(this.exec(`npx depcruise ${CORE_ROOT} --include-only "${includeOnly}" --output-type ${JSON_OUTPUT_FORMAT}`));
    }

    buildFolderDependencyDot(cruiseJson) {
        const modules = Array.isArray(cruiseJson.modules) ? cruiseJson.modules : [];
        const nodes   = new Set();
        const edges   = new Set();

        for (const mod of modules) {
            const sourcePath   = mod.source || mod.name || EMPTY_LINE;
            const sourceFolder = this.getTopLevelFolder(sourcePath);

            if (!sourceFolder) {
                continue;
            }

            const dependencies = Array.isArray(mod.dependencies) ? mod.dependencies : [];

            for (const dependency of dependencies) {
                const targetPath   = dependency.resolved || dependency.module || dependency.name || EMPTY_LINE;
                const targetFolder = this.getTopLevelFolder(targetPath);

                if (!targetFolder || sourceFolder === targetFolder) {
                    continue;
                }

                nodes.add(sourceFolder);
                nodes.add(targetFolder);
                edges.add(`${sourceFolder}${EDGE_DELIMITER}${targetFolder}`);
            }
        }

        return this.composeDotGraph(nodes, edges);
    }

    getTopLevelFolder(modulePath) {
        const normalized = modulePath.replace(/\\/g, PATH_SEPARATOR);

        if (!normalized.startsWith(`${CORE_ROOT}${PATH_SEPARATOR}`)) {
            return null;
        }

        const relativePath = normalized.slice(`${CORE_ROOT}${PATH_SEPARATOR}`.length);
        const parts        = relativePath.split(PATH_SEPARATOR);

        if (parts.length < MIN_NESTED_PATH_PARTS) {
            return null;
        }

        return parts[FIRST_ITEM_INDEX];
    }

    composeDotGraph(nodes, edges) {
        const sortedNodes = [...nodes].sort();
        const sortedEdges = [...edges].sort();

        const lines = [
            "digraph FolderDependencies {",
            `${DOT_INDENT}rankdir="${GRAPH_DIRECTION}";`,
            `${DOT_INDENT}graph [fontsize=${GRAPH_FONT_SIZE}, fontname="${FONT_FAMILY}"];`,
            `${DOT_INDENT}node [shape=${NODE_SHAPE}, style="${NODE_STYLE}", fontsize=${GRAPH_FONT_SIZE}, fontname="${FONT_FAMILY}"];`,
            `${DOT_INDENT}edge [fontsize=${EDGE_FONT_SIZE}, fontname="${FONT_FAMILY}"];`,
            EMPTY_LINE
        ];

        for (const node of sortedNodes) {
            lines.push(`${DOT_INDENT}"${node}";`);
        }

        if (sortedNodes.length && sortedEdges.length) {
            lines.push(EMPTY_LINE);
        }

        for (const edge of sortedEdges) {
            const [from, to] = edge.split(EDGE_DELIMITER);
            lines.push(`${DOT_INDENT}"${from}" -> "${to}";`);
        }

        lines.push(DOT_GRAPH_CLOSE);
        lines.push(EMPTY_LINE);
        return lines.join(NEWLINE);
    }

    clearGeneratedFiles() {
        for (const path of Object.values(OUTPUT_FILES)) {
            rmSync(path, REMOVE_FILE_OPTIONS);
        }
    }
}

const renderer = new ArchitectureRenderer();
renderer.run();
