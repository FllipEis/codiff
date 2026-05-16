const { basename, resolve } = require('node:path');
const { readRepositoryState } = require('./git-state.cjs');

const compactPath = (path) =>
  path.replace(/^\/Users\/[^/]+(?=\/|$)/, '~').replace(/^\/home\/[^/]+(?=\/|$)/, '~');

const getProjectLabel = (path) => basename(path) || compactPath(path);

const normalizeProjectRoots = (roots) => [
  ...new Set(roots.filter((root) => typeof root === 'string' && root).map((root) => resolve(root))),
];

const createProjectManager = ({ getLaunchPath, getPreferences, updatePreferences }) => {
  const windowRepositories = new Map();

  const getInitialProjectRoots = (activeRoot) => {
    const { projects } = getPreferences();
    return normalizeProjectRoots([activeRoot, ...(Array.isArray(projects) ? projects : [])]);
  };

  const seedWindow = (webContentsId, activeRoot) => {
    windowRepositories.set(webContentsId, {
      activeRoot,
      roots: getInitialProjectRoots(activeRoot),
    });
  };

  const removeWindow = (webContentsId) => {
    windowRepositories.delete(webContentsId);
  };

  const getWindowProjects = (webContentsId) => {
    const projects = windowRepositories.get(webContentsId);
    if (projects) {
      return projects;
    }

    const activeRoot = getLaunchPath();
    const fallback = {
      activeRoot,
      roots: getInitialProjectRoots(activeRoot),
    };
    windowRepositories.set(webContentsId, fallback);
    return fallback;
  };

  const getActiveRepositoryPath = (webContentsId) => getWindowProjects(webContentsId).activeRoot;

  const writeProjectState = (webContentsId, activeRoot, roots, persistLastProject = true) => {
    const normalizedRoots = normalizeProjectRoots(roots);
    windowRepositories.set(webContentsId, {
      activeRoot,
      roots: normalizedRoots,
    });

    updatePreferences((preferences) => ({
      ...preferences,
      lastProjectRoot: persistLastProject ? activeRoot : preferences.lastProjectRoot,
      projects: normalizedRoots,
    }));
  };

  const readProject = async (launchPath) => {
    const state = await readRepositoryState(launchPath);
    return {
      label: getProjectLabel(state.root),
      root: state.root,
    };
  };

  const readProjectList = async (webContentsId) => {
    const projects = getWindowProjects(webContentsId);
    const entries = [];
    const validRoots = [];

    for (const root of projects.roots) {
      try {
        const project = await readProject(root);
        entries.push(project);
        validRoots.push(project.root);
      } catch (error) {
        if (root === projects.activeRoot) {
          throw error;
        }
      }
    }

    if (validRoots.length !== projects.roots.length) {
      writeProjectState(webContentsId, projects.activeRoot, validRoots, false);
    }

    return {
      activeRoot: projects.activeRoot,
      entries,
    };
  };

  const addProject = (webContentsId, root) => {
    const projects = getWindowProjects(webContentsId);
    const nextRoots = normalizeProjectRoots([
      root,
      ...projects.roots.filter((projectRoot) => projectRoot !== root),
    ]);
    writeProjectState(webContentsId, root, nextRoots);
  };

  return {
    addProject,
    getActiveRepositoryPath,
    readProject,
    readProjectList,
    removeWindow,
    seedWindow,
  };
};

module.exports = {
  createProjectManager,
};
