import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageVersionConfig = Object.freeze({
    package: Object.freeze({
        jsonPath              : 'package.json',
        baseVersionPattern    : /^\d+\.\d+\.\d+-dev$/,
        baseVersionExample    : '0.1.0-dev',
        timestampSeparator    : '.',
        timestampPadLength    : 2,
        timestampPadCharacter : '0'
    }),

    cli: Object.freeze({
        argumentsStartIndex : 2,
        optionPrefix        : '--',
        valueSeparator      : '=',

        options: Object.freeze({
            action      : 'action',
            baseVersion : 'base-version'
        }),

        actions: Object.freeze({
            update   : 'update',
            rollback : 'rollback'
        })
    }),

    date: Object.freeze({ monthNumberOffset: 1 }),

    process: Object.freeze({
        failureExitCode : 1,
        utf8Encoding    : 'utf8',
        inheritedStdio  : 'inherit'
    }),

    platform: Object.freeze({windowsNames: Object.freeze(['win32'])}),

    executables: Object.freeze({
        git        : 'git',
        npm        : 'npm',
        npmWindows : 'npm.cmd'
    }),

    commands: Object.freeze({
        git: Object.freeze({
            referenceSeparator : ':',
            show               : 'show',
            head               : 'HEAD'
        }),

        npm: Object.freeze({
            version         : 'version',
            noGitTagVersion : '--no-git-tag-version',
            ignoreScripts   : '--ignore-scripts'
        })
    }),

    text: Object.freeze({
        emptyString : '',
        newlineChar : '\n'
    }),

    messages: Object.freeze({
        actionRequired      : 'The --action option is required.',
        baseVersionRequired : 'The --base-version option is required for the update action.',
        rollbackConflict    : 'The --base-version option cannot be used with the rollback action.',

        unknownArgument    : argument    => `Unknown argument: ${argument}`,
        unknownOption      : optionName  => `Unknown option: ${optionName}`,
        missingOptionValue : optionName  => `The --${optionName} option requires a value.`,
        duplicatedOption   : optionName  => `The --${optionName} option is duplicated.`,
        unsupportedAction  : action      => `Unsupported package version action: ${action}`,
        versionAlreadySet  : version     => `Package version is already ${version}.`,
        versionUpdated     : version     => `Package version updated to ${version}.`,
        versionRolledBack  : version     => `Package version rolled back to ${version}.`,
        invalidBaseVersion : baseVersion => [
            `Invalid base version: ${baseVersion}.`,
            `Expected base version format: ${packageVersionConfig.package.baseVersionExample}.`
        ].join(packageVersionConfig.text.newlineChar)
    })
});

class CommandLineOptions {
    #values;

    constructor(args) {
        this.#values = this.#parse(args);
    }

    static fromProcessArguments() {
        const processArguments     = Array.from(process.argv);
        const commandLineArguments = processArguments.splice(packageVersionConfig.cli.argumentsStartIndex);
        return new CommandLineOptions(commandLineArguments);
    }

    get action() {
        return this.#values.get(packageVersionConfig.cli.options.action) ?? null;
    }

    get baseVersion() {
        return this.#values.get(packageVersionConfig.cli.options.baseVersion) ?? null;
    }

    #parse(args) {
        const values = new Map();
        const supportedOptions = Object.values(packageVersionConfig.cli.options);

        for (const argument of args) {
            this.#validateArgument(argument);

            const optionExpression = argument.substring(packageVersionConfig.cli.optionPrefix.length);
            const optionParts      = optionExpression.split(packageVersionConfig.cli.valueSeparator);
            const optionName       = optionParts.shift();
            const optionValue      = optionParts.join(packageVersionConfig.cli.valueSeparator);

            this.#validateOption(
                optionName,
                optionValue,
                supportedOptions,
                values
            );

            values.set(optionName, optionValue);
        }

        return values;
    }

    #validateArgument(argument) {
        const hasOptionPrefix   = argument.startsWith(packageVersionConfig.cli.optionPrefix);
        const hasValueSeparator = argument.includes(packageVersionConfig.cli.valueSeparator);

        if (!hasOptionPrefix || !hasValueSeparator) {
            throw new Error(packageVersionConfig.messages.unknownArgument(argument));
        }
    }

    #validateOption(optionName, optionValue, supportedOptions, values) {
        if (!supportedOptions.includes(optionName)) {
            throw new Error(packageVersionConfig.messages.unknownOption(optionName));
        }

        if (!optionValue) {
            throw new Error(packageVersionConfig.messages.missingOptionValue(optionName));
        }

        if (values.has(optionName)) {
            throw new Error(packageVersionConfig.messages.duplicatedOption(optionName));
        }
    }
}

class PackageVersionTimestamp {
    static create() {
        const date = new Date();
        const timestampParts = [
            date.getUTCFullYear(),
            this.#pad(date.getUTCMonth() + packageVersionConfig.date.monthNumberOffset),
            this.#pad(date.getUTCDate()),
            this.#pad(date.getUTCHours()),
            this.#pad(date.getUTCMinutes()),
            this.#pad(date.getUTCSeconds())
        ];

        return timestampParts.join(packageVersionConfig.text.emptyString);
    }

    static #pad(value) {
        return String(value).padStart(
            packageVersionConfig.package.timestampPadLength,
            packageVersionConfig.package.timestampPadCharacter
        );
    }
}

class PackageVersionBuilder {
    static build(baseVersion) {
        const baseVersionIsValid = packageVersionConfig.package.baseVersionPattern.test(baseVersion);

        if (!baseVersionIsValid) {
            throw new Error(packageVersionConfig.messages.invalidBaseVersion(baseVersion));
        }

        return [baseVersion, PackageVersionTimestamp.create()].join(packageVersionConfig.package.timestampSeparator);
    }
}

class PackageVersionRepository {
    readCurrent() {
        return this.#readPackageJson().version;
    }

    readCommitted() {
        const packageJsonReference = [
            packageVersionConfig.commands.git.head,
            packageVersionConfig.package.jsonPath
        ].join(packageVersionConfig.commands.git.referenceSeparator);

        const packageJsonContent = execFileSync(
            packageVersionConfig.executables.git,
            [
                packageVersionConfig.commands.git.show,
                packageJsonReference
            ], { encoding: packageVersionConfig.process.utf8Encoding }
        );

        return JSON.parse(packageJsonContent).version;
    }

    update(version) {
        const currentVersion = this.readCurrent();

        if (Object.is(currentVersion, version)) {
            return false;
        }

        execFileSync(
            this.#getNpmExecutable(),
            [
                packageVersionConfig.commands.npm.version,
                version,
                packageVersionConfig.commands.npm.noGitTagVersion,
                packageVersionConfig.commands.npm.ignoreScripts
            ], { stdio: packageVersionConfig.process.inheritedStdio }
        );

        return true;
    }

    #getNpmExecutable() {
        const windowsPlatform = packageVersionConfig.platform.windowsNames.includes(process.platform);

        return windowsPlatform
            ? packageVersionConfig.executables.npmWindows
            : packageVersionConfig.executables.npm;
    }

    #readPackageJson() {
        const packageJsonContent = readFileSync(
            packageVersionConfig.package.jsonPath,
            packageVersionConfig.process.utf8Encoding
        );

        return JSON.parse(packageJsonContent);
    }
}

class UpdatePackageVersionApp {
    #options;
    #repository;

    constructor(options, repository) {
        this.#options    = options;
        this.#repository = repository;
    }

    static run() {
        try {
            const options    = CommandLineOptions.fromProcessArguments();
            const repository = new PackageVersionRepository();
            const app        = new UpdatePackageVersionApp(options, repository);
            app.#execute();
        } catch (error) {
            console.error(error.message);
            process.exitCode = packageVersionConfig.process.failureExitCode;
        }
    }

    #execute() {
        const action = this.#options.action;

        if (!action) {
            throw new Error(packageVersionConfig.messages.actionRequired);
        }

        switch (action) {
            case packageVersionConfig.cli.actions.update:
                this.#update();
                break;

            case packageVersionConfig.cli.actions.rollback:
                this.#rollback();
                break;

            default:
                throw new Error(packageVersionConfig.messages.unsupportedAction(action));
        }
    }

    #update() {
        const baseVersion = this.#options.baseVersion;

        if (!baseVersion) {
            throw new Error(packageVersionConfig.messages.baseVersionRequired);
        }

        const newVersion     = PackageVersionBuilder.build(baseVersion);
        const versionChanged = this.#repository.update(newVersion);
        const message        = versionChanged
            ? packageVersionConfig.messages.versionUpdated(newVersion)
            : packageVersionConfig.messages.versionAlreadySet(newVersion);

        console.log(message);
    }

    #rollback() {
        if (this.#options.baseVersion) {
            throw new Error(packageVersionConfig.messages.rollbackConflict);
        }

        const committedVersion = this.#repository.readCommitted();
        const versionChanged   = this.#repository.update(committedVersion);
        const message          = versionChanged
            ? packageVersionConfig.messages.versionRolledBack(committedVersion)
            : packageVersionConfig.messages.versionAlreadySet(committedVersion);

        console.log(message);
    }
}

UpdatePackageVersionApp.run();
