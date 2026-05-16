import type {
  CodiffPreferences,
  DiffSection,
  DiffSectionContentRequest,
  ProjectList,
  RepositoryHistory,
  RepositoryState,
  ReviewSource,
} from './types.ts';

declare global {
  interface Window {
    codiff: {
      getDiffSectionContent: (request: DiffSectionContentRequest) => Promise<DiffSection>;
      getPreferences: () => Promise<CodiffPreferences>;
      getProjects: () => Promise<ProjectList>;
      getRepositoryHistory: (limit?: number) => Promise<RepositoryHistory>;
      getRepositoryState: (source?: ReviewSource) => Promise<RepositoryState>;
      onPreferencesChanged: (callback: (preferences: CodiffPreferences) => void) => () => void;
      onRepositoryChanged: (callback: (change: { root: string }) => void) => () => void;
      openProject: () => Promise<ProjectList>;
      selectProject: (root: string) => Promise<ProjectList>;
      showInFolder: (path: string) => Promise<void>;
    };
  }
}
