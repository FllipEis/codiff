import type {
  CodiffPreferences,
  CodiffLaunchOptions,
  DiffSection,
  DiffSectionContentRequest,
  GitIdentity,
  ProjectList,
  RepositoryHistory,
  RepositoryState,
  ReviewSource,
  WalkthroughResult,
} from './types.ts';

declare global {
  interface Window {
    codiff: {
      getDiffSectionContent: (request: DiffSectionContentRequest) => Promise<DiffSection>;
      getGitIdentity: () => Promise<GitIdentity>;
      getLaunchOptions: () => Promise<CodiffLaunchOptions>;
      getPreferences: () => Promise<CodiffPreferences>;
      getProjects: () => Promise<ProjectList>;
      getRepositoryHistory: (limit?: number) => Promise<RepositoryHistory>;
      getRepositoryState: (source?: ReviewSource) => Promise<RepositoryState>;
      getWalkthrough: (source?: ReviewSource) => Promise<WalkthroughResult>;
      onFindInDiffs: (callback: () => void) => () => void;
      onPreferencesChanged: (callback: (preferences: CodiffPreferences) => void) => () => void;
      onRepositoryChanged: (callback: (change: { root: string }) => void) => () => void;
      openProject: () => Promise<ProjectList>;
      selectProject: (root: string) => Promise<ProjectList>;
      showInFolder: (path: string) => Promise<void>;
    };
  }
}
