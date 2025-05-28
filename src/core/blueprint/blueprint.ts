import fs from 'fs';
import path from 'node:path';
// import { resolveProjectPath } from '../util/path';

export const resolveProjectPath = (...additionalPaths: string[]) => {
    return path.join(path.resolve('.'), ...additionalPaths);
};

const buildBlueprintPath = (blueprintName: string) => {
    return path.join(__dirname, '..', '..', '..', 'blueprints', blueprintName);
};

export const blueprintExists = (blueprintName: string) => {
    return fs.existsSync(buildBlueprintPath(blueprintName));
};

export const renderBlueprint = async (blueprintName: string, { forceOverwrite }: {
    forceOverwrite: boolean;
}) => {
    const destination = 'transit-gw';
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
    }
    const projectRoot = resolveProjectPath(destination);
    const blueprintRoot = buildBlueprintPath(blueprintName);
    // when testing locally, there might be node dependencies we just ignore them.
    const filePaths = (await fs.promises.readdir(blueprintRoot, {
        recursive: true,
    })).filter((fp) => !fp.includes('node_modules')
        && !fp.includes('package-lock.json')
        && !fp.includes('yarn.lock')
        && !fp.includes('pnpm-lock.yaml')
        && !fp.includes('cdk.context.json')
        && !fp.includes('cdk.out.')
    );
    // Copy all blueprint files to the project root
    for (const filePath of filePaths) {
        const source = path.join(blueprintRoot, filePath);
        const target = path.join(projectRoot, filePath);
        // If is a directory, ensure to create it in the project root
        if (fs.lstatSync(source).isDirectory()) {
            // Create the directory in the output path if it doesn't exist
            if (!fs.existsSync(target)) {
                fs.mkdirSync(target);
            }
        } else {
            // if a target file already exists, skip it until force overwrite is enabled
            if (!forceOverwrite && fs.existsSync(target)) {
                console.log(`Skipping ${target} because it already exists.`);
                continue;
            }
            fs.copyFileSync(source, target);
        }
    }
};